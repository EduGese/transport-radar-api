import { Injectable } from '@nestjs/common';

export interface Vehicle {
  id: string;
  type: 'aircraft' | 'train';
  callsign: string;
  originCountry: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}

@Injectable()
export class VehiclesService {
  private readonly vehicles: Vehicle[] = [
    {
      id: '1',
      type: 'aircraft',
      callsign: 'IBE1234',
      originCountry: 'Spain',
      latitude: 40.4168,
      longitude: -3.7038,
      altitude: 10000,
      heading: 180,
      speed: 750,
    },
    {
      id: '2',
      type: 'aircraft',
      callsign: 'AFR5678',
      originCountry: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      altitude: 9000,
      heading: 90,
      speed: 720,
    },
  ];

  findAll(): Vehicle[] {
    return this.vehicles;
  }

  findOne(id: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id === id);
  }
}
