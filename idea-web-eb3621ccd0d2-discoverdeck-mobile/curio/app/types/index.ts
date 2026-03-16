export interface App {
  name: string;
  description: string;
  icon: string;
  storeUrl: string;
  tags: string[];
}

export interface CuratedList {
  title: string;
  apps: App[];
}
