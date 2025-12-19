export class FlightDto {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  heading: number | null;
  velocity: number | null;
  category: number | null;
}
