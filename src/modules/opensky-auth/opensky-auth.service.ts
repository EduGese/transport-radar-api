import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OpenSkyTokenResponseDto } from './dto/opensky-token-response.dto';

/**
 * Handles OAuth2 authentication with OpenSky Network API.
 * Implements token caching with automatic refresh.
 */
@Injectable()
export class OpenSkyAuthService {
  private readonly logger = new Logger(OpenSkyAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tokenEndpoint: string;

  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  private readonly TOKEN_REFRESH_MARGIN = 60;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<{
      clientId: string;
      clientSecret: string;
      tokenUrl: string;
    }>('opensky');

    if (!config?.clientId || !config?.clientSecret || !config?.tokenUrl) {
      throw new Error(
        'OpenSky credentials not configured in environment variables',
      );
    }

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tokenEndpoint = config.tokenUrl;

    this.logger.log('OpenSky auth service initialized');
  }

  /**
   * Returns a valid access token, refreshing if necessary.
   * Implements automatic caching and expiry management.
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now() / 1000;

    if (
      this.cachedToken &&
      this.tokenExpiresAt > now + this.TOKEN_REFRESH_MARGIN
    ) {
      return this.cachedToken;
    }

    return this.refreshToken();
  }

  /**
   * Fetches a new access token from OpenSky OAuth2 endpoint.
   */
  private async refreshToken(): Promise<string> {
    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const { data } = await firstValueFrom(
        this.http.post<OpenSkyTokenResponseDto>(this.tokenEndpoint, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 5000,
        }),
      );

      const now = Date.now() / 1000;
      this.cachedToken = data.access_token;
      this.tokenExpiresAt = now + data.expires_in - this.TOKEN_REFRESH_MARGIN;

      this.logger.log(
        `New OpenSky token obtained, expires in ${data.expires_in}s`,
      );

      return data.access_token;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get OpenSky token: ${errorMsg}`);

      this.cachedToken = null;
      this.tokenExpiresAt = 0;

      throw new Error('OpenSky authentication failed');
    }
  }

  /**
   * Returns remaining time until token expiry (seconds).
   * Useful for monitoring and debugging.
   */
  getTokenExpiryTime(): number {
    return Math.max(0, this.tokenExpiresAt - Date.now() / 1000);
  }
}
