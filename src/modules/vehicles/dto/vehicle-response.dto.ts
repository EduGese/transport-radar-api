export class VehicleResponseDto {
  id: string;
  type: 'aircraft' | 'train';
  callsign: string | null;
  originCountry: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}
