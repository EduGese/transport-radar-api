import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FlightDto } from './dto/flight.dto';
import {
  OpenSkyStatesResponse,
  OpenSkyStateVector,
} from './interfaces/opensky-state-vector.interface';
import { FlightsLiveResponseDto } from './dto/flights-live-response.dto';
import { AircraftService } from '../aircraft/aircraft.service';
import { OpenSkyAuthService } from '../opensky-auth/opensky-auth.service';
import { CachedSnapshot } from './interfaces/cached-snapshot.interface';
import { FlightsBbox } from './interfaces/flights-bbox.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Manages flight data fetching, caching, and polling.
 * Singleton service that maintains a shared cache of flight states from OpenSky API.
 * Implements dynamic polling based on rate limit consumption.
 */
@Injectable()
export class FlightsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FlightsService.name);
  private readonly baseUrl: string;

  // ===== Cache & Polling State =====
  private latestSnapshot: CachedSnapshot | null = null;
  private timer: NodeJS.Timeout | null = null;
  private pollingIntervalMs = 8000;

  // ===== Rate Limit Management =====
  private rateLimitRemaining: number | null = null;
  private readonly RATE_LIMIT_HIGH = 3000;
  private readonly RATE_LIMIT_LOW = 500;

  constructor(
    private readonly http: HttpService,
    private readonly aircraftService: AircraftService,
    private readonly authService: OpenSkyAuthService,
    private readonly configService: ConfigService,
  ) {
    const openskyConfig = this.configService.get<{ baseUrl: string }>(
      'opensky',
    )!;
    this.baseUrl = openskyConfig.baseUrl;
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Returns cached flight data, optionally filtered by bounding box.
   * @param bbox - Optional geographic filter (lat/lon min/max)
   * @returns Cached flight data with metadata
   */
  getLiveFlights(bbox?: FlightsBbox): FlightsLiveResponseDto {
    if (!this.latestSnapshot) {
      this.logger.warn('No snapshot available yet');
      return { time: Math.floor(Date.now() / 1000), flights: [] };
    }

    const flights = bbox
      ? this.filterFlightsByBbox(this.latestSnapshot.flights, bbox)
      : this.latestSnapshot.flights;

    return {
      time: this.latestSnapshot.time,
      flights,
      cacheAgeMs: Date.now() - this.latestSnapshot.fetchedAt,
      pollingIntervalMs: this.pollingIntervalMs,
      nextUpdateInMs:
        this.pollingIntervalMs - (Date.now() % this.pollingIntervalMs),
    };
  }

  // ========================================
  // Lifecycle Hooks
  // ========================================

  async onModuleInit(): Promise<void> {
    this.logger.log('🚀 Starting flight polling');
    await this.refreshSnapshot();
    this.startPolling();
  }

  onModuleDestroy(): void {
    this.stopPolling();
    this.logger.log('🛑 Polling stopped');
  }

  // ========================================
  // Polling Management
  // ========================================

  private startPolling(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.refreshSnapshot().catch((err: Error) => {
        this.logger.error(`Polling error: ${err.message}`);
      });
    }, this.pollingIntervalMs);

    const credits = this.rateLimitRemaining ?? 'unknown';
    this.logger.log(
      `⏰ Polling ${this.pollingIntervalMs / 1000}s (${credits} credits)`,
    );
  }

  private stopPolling(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartPolling(): void {
    this.stopPolling();
    this.startPolling();
  }

  /**
   * Adjusts polling interval based on remaining API credits.
   * - >3000: 8s (aggressive)
   * - 500-3000: 30s (balanced)
   * - <500: 60s (conservative)
   */
  private adjustPollingInterval(): void {
    if (this.rateLimitRemaining === null) return;

    let newInterval: number;
    let emoji: string;
    let status: string;

    switch (true) {
      case this.rateLimitRemaining > this.RATE_LIMIT_HIGH:
        newInterval = 8000;
        emoji = '🟢';
        status = 'high - 8s';
        break;
      case this.rateLimitRemaining > this.RATE_LIMIT_LOW:
        newInterval = 30000;
        emoji = '🟡';
        status = 'medium - 30s';
        break;
      default:
        newInterval = 60000;
        emoji = '🔴';
        status = 'low - 60s';
        break;
    }

    if (this.pollingIntervalMs !== newInterval) {
      this.pollingIntervalMs = newInterval;
      this.logger.log(
        `${emoji} Credits ${this.rateLimitRemaining} → Polling ${status}`,
      );
      this.restartPolling();
    }
  }

  // ========================================
  // Data Fetching & Caching
  // ========================================

  /**
   * Fetches fresh flight data from OpenSky API and updates cache.
   * Uses fixed Iberian Peninsula bbox for polling.
   */
  private async refreshSnapshot(): Promise<void> {
    const bbox = this.getDefaultIberianBbox();
    const params: Record<string, number> = { ...bbox };
    const url = `${this.baseUrl}/states/all`;
    const token = await this.authService.getAccessToken();

    try {
      const { data, headers } = await firstValueFrom(
        this.http.get<OpenSkyStatesResponse>(url, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      this.updateRateLimitFromHeaders(
        headers as Record<string, string | string[] | undefined>,
      );

      const flights = await Promise.all(
        data.states.map((state) => this.mapStateToDtoWithMetadata(state)),
      );

      this.latestSnapshot = {
        flights: flights.filter((f) => f.latitude && f.longitude),
        time: data.time,
        fetchedAt: Date.now(),
      };

      this.logger.log(
        `✅ Snapshot saved: ${this.latestSnapshot.flights.length} flights`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `❌ Refresh error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  private updateRateLimitFromHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): void {
    const headerValue = headers['x-rate-limit-remaining'];

    const creditStr = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (creditStr) {
      this.rateLimitRemaining = parseInt(creditStr, 10);
      this.logger.log(`📊 Remaining credits: ${this.rateLimitRemaining}`);
      this.adjustPollingInterval();
    } else {
      this.logger.warn('⚠️ No rate limit header received');
    }
  }

  // ========================================
  // Data Mapping & Filtering
  // ========================================

  private mapStateToDto(state: OpenSkyStateVector): FlightDto {
    const dto = new FlightDto();
    dto.icao24 = state[0];
    dto.callsign = state[1] ? String(state[1]).trim() : null;
    dto.originCountry = state[2];
    dto.timePosition = state[3];
    dto.lastContact = state[4];
    dto.longitude = state[5];
    dto.latitude = state[6];
    dto.altitudeBaro = state[7];
    dto.altitudeGeo = state[13];
    dto.onGround = state[8];
    dto.velocity = state[9];
    dto.heading = state[10];
    dto.verticalRate = state[11];
    dto.squawk = state[14];
    dto.spi = state[15];
    return dto;
  }

  /**
   * Enriches flight DTO with aircraft metadata from local database.
   */
  private async mapStateToDtoWithMetadata(
    state: OpenSkyStateVector,
  ): Promise<FlightDto> {
    const dto = this.mapStateToDto(state);
    const aircraft = await this.aircraftService.findByIcao24(dto.icao24);

    if (aircraft) {
      dto.category = aircraft.category_description || null;
      dto.model = aircraft.model || null;
      dto.operator = aircraft.operator || null;
      dto.operatorIcao = aircraft.operator_icao || null;
      dto.owner = aircraft.owner || null;
      dto.typecode = aircraft.typecode || null;
      dto.registration = aircraft.registration || null;
    }

    return dto;
  }

  /**
   * Filters flights by geographic bounding box.
   * Returns all flights if bbox is incomplete.
   */
  private filterFlightsByBbox(
    flights: FlightDto[],
    bbox: FlightsBbox,
  ): FlightDto[] {
    if (!bbox.lamin || !bbox.lomin || !bbox.lamax || !bbox.lomax) {
      return flights;
    }

    return flights.filter(
      (flight) =>
        flight.latitude != null &&
        flight.longitude != null &&
        flight.latitude >= bbox.lamin! &&
        flight.latitude <= bbox.lamax! &&
        flight.longitude >= bbox.lomin! &&
        flight.longitude <= bbox.lomax!,
    );
  }

  private getDefaultIberianBbox(): FlightsBbox {
    return {
      lamin: 35.0,
      lomin: -10.0,
      lamax: 44.5,
      lomax: 5.0,
    };
  }
}
