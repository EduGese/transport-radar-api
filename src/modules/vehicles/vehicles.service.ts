import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleEntity } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehiclesRepository: Repository<VehicleEntity>,
  ) {}

  async findAll(): Promise<VehicleEntity[]> {
    const entities = await this.vehiclesRepository.find();
    return entities.map((entity) => this.toResponseDto(entity));
  }

  async findOne(id: string): Promise<VehicleEntity | null> {
    const entity = await this.vehiclesRepository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toResponseDto(entity);
  }

  private toResponseDto(entity: VehicleEntity): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.callsign = entity.callsign;
    dto.originCountry = entity.originCountry;
    dto.latitude = entity.latitude;
    dto.longitude = entity.longitude;
    dto.altitude = entity.altitude;
    dto.heading = entity.heading;
    dto.speed = entity.speed;
    return dto;
  }
}
