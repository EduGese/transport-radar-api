import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FlightsBbox } from '../interfaces/flights-bbox.interface';

export class FlightsBboxQueryDto implements FlightsBbox {
  @ApiPropertyOptional({ example: 40.0, description: 'Min latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lamin?: number;

  @ApiPropertyOptional({ example: -3.7, description: 'Min longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lomin?: number;

  @ApiPropertyOptional({ example: 41.0, description: 'Max latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lamax?: number;

  @ApiPropertyOptional({ example: -2.0, description: 'Max longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lomax?: number;
}
