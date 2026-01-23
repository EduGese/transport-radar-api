import { Controller, Get, Param, Logger } from '@nestjs/common';
import { AircraftPhotosService } from './aircraft-photos.service';

@Controller('api/aircraft-photos')
export class AircraftPhotosController {
  private readonly logger = new Logger(AircraftPhotosController.name);

  constructor(private readonly photosService: AircraftPhotosService) {}
  @Get(':icao24')
  getAircraftPhotos(@Param('icao24') icao24: string) {
    return this.photosService.getPhotosByIcao24(icao24);
  }
}
