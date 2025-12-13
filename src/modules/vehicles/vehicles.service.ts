import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleEntity } from './entities/vehicle.entity';
import { Repository } from 'typeorm';

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
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
  ) {}

  async findAll(): Promise<VehicleEntity[]> {
    return this.vehiclesRepository.find();
  }

  async findOne(id: string): Promise<VehicleEntity | null> {
    return this.vehiclesRepository.findOne({ where: { id } });
  }
}
