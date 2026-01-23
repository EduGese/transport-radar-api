import { Module } from '@nestjs/common';
//import { AircraftPhotosService } from './aircraft-photos.service';
import { AircraftPhotosController } from './aircraft-photos.controller';
import { HttpModule } from '@nestjs/axios';
import { AircraftPhotosService } from './aircraft-photos.service';

@Module({
  imports: [HttpModule],
  providers: [AircraftPhotosService],
  controllers: [AircraftPhotosController],
})
export class AircraftPhotosModule {}
