import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { FlightsModule } from './modules/flights/flights.module';
import { AircraftModule } from './modules/aircraft/aircraft.module';
import { OpenSkyAuthModule } from './modules/opensky-auth/opensky-auth.module';
import { AircraftPhotosModule } from './modules/aircraft-photos/aircraft-photos.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<{
          host: string;
          port: number;
          user: string;
          password: string;
          name: string;
        }>('database');

        return {
          type: 'postgres' as const,
          host: dbConfig?.host,
          port: dbConfig?.port,
          username: dbConfig?.user,
          password: dbConfig?.password,
          database: dbConfig?.name,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    HealthModule,
    VehiclesModule,
    FlightsModule,
    AircraftModule,
    OpenSkyAuthModule,
    AircraftPhotosModule,
  ],
  providers: [],
})
export class AppModule {}
