export interface OpenSkyStatesResponse {
  time: number;
  states: OpenSkyStateVector[];
}

export type OpenSkyStateVector = [
  icao24: string,
  callsign: string | null,
  origin_country: string,
  time_position: number | null,
  last_contact: number,
  longitude: number | null,
  latitude: number | null,
  baro_altitude: number | null,
  on_ground: boolean,
  velocity: number | null,
  true_track: number | null,
  vertical_rate: number | null,
  sensors: number[] | null,
  geo_altitude: number | null,
  squawk: string | null,
  spi: boolean,
  position_source: 0 | 1 | 2 | 3,
  category: number | null,
];
