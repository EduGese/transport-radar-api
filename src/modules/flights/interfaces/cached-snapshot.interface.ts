import { FlightDto } from '../dto/flight.dto';

export interface CachedSnapshot {
  flights: FlightDto[];
  time: number;
  fetchedAt: number;
}
