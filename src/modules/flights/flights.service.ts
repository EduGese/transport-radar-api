import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private readonly baseUrl = 'https://opensky-network.org/api';

  constructor(
    private readonly http: HttpService,
    private readonly aircraftService: AircraftService,
    private readonly authService: OpenSkyAuthService,
  ) {}

  async getLiveFlights(bbox?: {
    lamin: number;
    lomin: number;
    lamax: number;
    lomax: number;
  }): Promise<FlightsLiveResponseDto> {
    const params: Record<string, string | number> = {};
    // if (bbox) {
    //   // OpenSky usa bbox=lamin,lomin,lamax,lomax
    //   params.bbox = `${bbox.lamin},${bbox.lomin},${bbox.lamax},${bbox.lomax}`;
    // }
    const finalBbox = bbox ?? {
      lamin: 35.0,
      lamax: 44.5,
      lomin: -10.0,
      lomax: 5.0,
    };

    params.lamin = finalBbox.lamin;
    params.lamax = finalBbox.lamax;
    params.lomin = finalBbox.lomin;
    params.lomax = finalBbox.lomax;

    const url = `${this.baseUrl}/states/all`;
    const token = await this.authService.getAccessToken();
    try {
      const { data } = await firstValueFrom(
        this.http.get<OpenSkyStatesResponse>(url, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      if (!data || !data.states) {
        return {
          time: data?.time ?? Math.floor(Date.now() / 1000),
          flights: [],
        };
      }
      const flights = await Promise.all(
        data.states.map((state) => this.mapStateToDtoWithMetadata(state)),
      );
      return {
        time: data.time,
        flights,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching OpenSky data:  ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return {
        time: Math.floor(Date.now() / 1000),
        flights: [],
      };
    }
  }

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
    return dto;
  }
  private async mapStateToDtoWithMetadata(
    state: OpenSkyStateVector,
  ): Promise<FlightDto> {
    const dto = this.mapStateToDto(state);

    const aircraft = await this.aircraftService.findByIcao24(dto.icao24);
    if (aircraft) {
      dto.category =
        aircraft.category_description === ''
          ? null
          : aircraft.category_description;
      dto.model = aircraft.model === '' ? null : aircraft.model;
      dto.operator = aircraft.operator === '' ? null : aircraft.operator;
      dto.operatorIcao =
        aircraft.operator_icao === '' ? null : aircraft.operator_icao;
      dto.owner = aircraft.owner === '' ? null : aircraft.owner;
    }

    return dto;
  }
}
