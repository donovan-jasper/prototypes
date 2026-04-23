export interface AppRecommendation {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  appStoreUrl: string;
  categories: string[];
}

export interface CuratedList {
  title: string;
  apps: AppRecommendation[];
}
