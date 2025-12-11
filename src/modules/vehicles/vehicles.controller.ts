import { Controller, Get, Param } from '@nestjs/common';
import { VehiclesService, Vehicle } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  getVehicles(): Vehicle[] {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  getVehicleById(@Param('id') id: string): Vehicle | undefined {
    return this.vehiclesService.findOne(id);
  }
}
