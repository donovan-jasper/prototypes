export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  storeUrl: string;
  tags: string[];
  category: string;
  useCases: string[];
  rating: number;
}

export interface CuratedList {
  title: string;
  apps: App[];
}
