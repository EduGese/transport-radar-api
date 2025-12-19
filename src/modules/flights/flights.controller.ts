import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsLiveResponseDto } from './dto/flights-live-response.dto';

@Controller('api/flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('live')
  async getLiveFlights(
    @Query('lamin') lamin?: string,
    @Query('lomin') lomin?: string,
    @Query('lamax') lamax?: string,
    @Query('lomax') lomax?: string,
  ): Promise<FlightsLiveResponseDto> {
    let bbox:
      | { lamin: number; lomin: number; lamax: number; lomax: number }
      | undefined;

    if (lamin && lomin && lamax && lomax) {
      bbox = {
        lamin: Number(lamin),
        lomin: Number(lomin),
        lamax: Number(lamax),
        lomax: Number(lomax),
      };
    }
    console.log(
      'this.flightsService.getLiveFlights(bbox)',
      this.flightsService.getLiveFlights(bbox),
    );
    return this.flightsService.getLiveFlights(bbox);
  }
}
