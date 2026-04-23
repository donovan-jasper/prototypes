export interface AppRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  iconUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  rating: number;
  reviewCount: number;
  expertRating?: number;
  isFeatured?: boolean;
}
