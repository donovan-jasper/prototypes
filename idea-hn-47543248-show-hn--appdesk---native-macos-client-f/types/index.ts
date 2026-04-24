export interface AppData {
  id: string;
  name: string;
  iconUrl: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  revenue: number;
  sales: number;
}

export interface AnalyticsData {
  date: string;
  sales: number;
  downloads: number;
  ratings: number;
  revenue: number;
}
