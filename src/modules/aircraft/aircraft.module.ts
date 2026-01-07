import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AircraftEntity } from './entities/aircraft.entity';
import { AircraftService } from './aircraft.service';

@Module({
  imports: [TypeOrmModule.forFeature([AircraftEntity])],
  providers: [AircraftService],
  exports: [AircraftService],
})
export class AircraftModule {}
