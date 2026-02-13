import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { FlightsLiveResponseDto } from './dto/flights-live-response.dto';
import { FlightsBboxQueryDto } from './dto/flights-bbox-query.dto';

@ApiTags('Flights')
@Controller('api/flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('live')
  @ApiOperation({ summary: 'Get live flights (cached)' })
  @ApiResponse({ status: 200, type: FlightsLiveResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid bbox parameters' })
  getLiveFlights(
    @Query() bboxQuery?: FlightsBboxQueryDto,
  ): FlightsLiveResponseDto {
    return this.flightsService.getLiveFlights(bboxQuery);
  }
}
