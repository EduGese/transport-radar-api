export interface PlanespottersResponse {
  photos: Array<{
    thumbnail: { src: string };
    thumbnail_large: { src: string };
    link: string;
    photographer: string;
  }> | null;
  error?: string;
}
