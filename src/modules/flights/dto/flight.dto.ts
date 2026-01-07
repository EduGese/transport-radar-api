export class FlightDto {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  latitude: number | null;
  longitude: number | null;
  altitudeBaro: number | null;
  altitudeGeo: number | null;
  heading: number | null;
  onGround: boolean;
  velocity: number | null;
  category: string | null;
  model: string | null;
  operator: string | null;
  operatorIcao: string | null;
  owner: string | null;
}
