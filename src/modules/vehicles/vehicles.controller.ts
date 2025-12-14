import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
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
    const vehicle = await this.vehiclesService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }
    return vehicle;
  }
}
