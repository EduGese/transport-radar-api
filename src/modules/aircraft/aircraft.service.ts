import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AircraftEntity } from './entities/aircraft.entity';

@Injectable()
export class AircraftService {
  constructor(
    @InjectRepository(AircraftEntity)
    private readonly repo: Repository<AircraftEntity>,
  ) {}

  findByIcao24(icao24: string): Promise<AircraftEntity | null> {
    return this.repo.findOne({ where: { icao24 } });
  }
}
