import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AircraftPhotoResponseDto } from './dto/aircraft-photo-response.dto';
import { PlanespottersResponse } from './interfaces/planespotter-response.interface';

@Injectable()
export class AircraftPhotosService {
  private readonly baseUrl = 'https://api.planespotters.net/pub/photos/hex';

  constructor(private readonly httpService: HttpService) {}

  async getPhotosByIcao24(
    icao24: string,
  ): Promise<AircraftPhotoResponseDto | null> {
    const url = `${this.baseUrl}/${icao24}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PlanespottersResponse>(url).pipe(timeout(5000)),
      );

      if (data.error || !data.photos?.[0]) {
        return null;
      }

      const photo = data.photos[0];
      const dto = new AircraftPhotoResponseDto();
      dto.thumbnailUrl = photo.thumbnail.src;
      dto.largeUrl = photo.thumbnail_large.src;
      dto.link = photo.link;
      dto.photographer = photo.photographer;
      dto.attribution = `© ${photo.photographer} / Planespotters.net`;

      return dto;
    } catch (error) {
      console.error(
        `AircraftPhotosService error: ${
          error instanceof Error ? error.message : 'Unknown'
        }`,
      );
      return null;
    }
  }
}
