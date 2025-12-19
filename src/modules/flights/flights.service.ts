import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FlightDto } from './dto/flight.dto';
import {
  OpenSkyStatesResponse,
  OpenSkyStateVector,
} from './interfaces/opensky-state-vector.interface';
import { FlightsLiveResponseDto } from './dto/flights-live-response.dto';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);
  private readonly baseUrl = 'https://opensky-network.org/api';

  constructor(private readonly http: HttpService) {}

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

    const { data } = await firstValueFrom(
      this.http.get<OpenSkyStatesResponse>(url, { params }),
    );

    if (!data || !data.states) {
      return {
        time: data?.time ?? Math.floor(Date.now() / 1000),
        flights: [],
      };
    }
    console.log('data.states', data.states);
    const flights = (data.states ?? []).map((state: OpenSkyStateVector) =>
      this.mapStateToDto(state),
    );
    return {
      time: data.time,
      flights,
    };
  }

  private mapStateToDto(state: OpenSkyStateVector): FlightDto {
    const dto = new FlightDto();
    dto.icao24 = state[0];
    dto.callsign = state[1] ? String(state[1]).trim() : null;
    dto.originCountry = state[2];
    dto.longitude = state[5];
    dto.latitude = state[6];
    dto.altitude = state[7];
    dto.velocity = state[9];
    dto.heading = state[10];
    dto.category = state[17];
    return dto;
  }
}
