export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  platforms: Platform[];
  syncStatus: 'synced' | 'pending' | 'error';
  createdAt: string;
  updatedAt: string;
}

export type Platform = 'ebay' | 'etsy' | 'depop' | 'poshmark' | 'facebook';

export interface PlatformConnection {
  id: string;
  name: Platform;
  enabled: boolean;
  apiToken?: string;
  lastSync?: string;
}

export interface AppState {
  listings: Listing[];
  platforms: PlatformConnection[];
  isOnline: boolean;
  isSyncing: boolean;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  togglePlatform: (platformId: string) => void;
  triggerSync: () => Promise<void>;
}
