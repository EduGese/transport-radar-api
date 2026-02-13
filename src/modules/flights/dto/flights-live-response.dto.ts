import { ApiProperty } from '@nestjs/swagger';
import { FlightDto } from './flight.dto';

export class FlightsLiveResponseDto {
  @ApiProperty() time: number;
  @ApiProperty({ type: [FlightDto] }) flights: FlightDto[];
  @ApiProperty({ required: false }) cacheAgeMs?: number;
  @ApiProperty({ required: false }) pollingIntervalMs?: number;
  @ApiProperty({ required: false }) nextUpdateInMs?: number;
}
