export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  platforms: string[];
  syncStatus: 'synced' | 'pending' | 'error';
  attributes?: Record<string, any>;
  tags?: string[];
}

export interface Platform {
  id: number;
  name: string;
  apiToken?: string;
  enabled: boolean;
}

export interface SyncQueueItem {
  id?: number;
  listingId: string;
  platform: string;
  action: 'create' | 'update' | 'delete';
  listing: Listing | null;
  status: 'pending' | 'completed' | 'failed';
}
