import { Controller, Get, Param } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehicleEntity } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async getVehicles(): Promise<VehicleEntity[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  async getVehicleById(@Param('id') id: string): Promise<VehicleEntity | null> {
    return this.vehiclesService.findOne(id);
  }
}
