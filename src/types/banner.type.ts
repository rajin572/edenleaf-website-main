export type BannerPlacement = 'hero' | 'hero_side' | 'marketing_left' | 'marketing_right';

export interface IBanner {
  _id: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  destinationUrl: string;
  image: string;
  placement: BannerPlacement;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
