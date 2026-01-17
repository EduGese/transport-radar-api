import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OpenSkyTokenResponseDto } from './dto/opensky-token-response.dto';

@Injectable()
export class OpenSkyAuthService {
  private readonly logger = new Logger(OpenSkyAuthService.name);
  private readonly tokenEndpoint =
    'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now() / 1000;
    if (this.cachedToken && this.tokenExpiresAt > now + 60) {
      return this.cachedToken;
    }

    try {
      const clientId = this.config.get<string>('OPENSKY_CLIENT_ID');
      const clientSecret = this.config.get<string>('OPENSKY_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('OpenSky credentials not configured');
      }

      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const { data } = await firstValueFrom(
        this.http.post<OpenSkyTokenResponseDto>(this.tokenEndpoint, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      this.cachedToken = data.access_token;
      this.tokenExpiresAt = now + data.expires_in - 60; // margen de 60s

      this.logger.log(
        `New OpenSky token obtained, expires in ${data.expires_in}s`,
      );

      return data.access_token;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get OpenSky token: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      throw new Error('OpenSky authentication failed');
    }
  }
}
