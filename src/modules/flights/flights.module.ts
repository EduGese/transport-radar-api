import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { AircraftModule } from '../aircraft/aircraft.module';

@Module({
  imports: [HttpModule, AircraftModule],
  providers: [FlightsService],
  controllers: [FlightsController],
})
export class FlightsModule {}
