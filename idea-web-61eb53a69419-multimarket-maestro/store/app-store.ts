import { create } from 'zustand';
import { AppState, Listing, PlatformConnection } from '../types';

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Vintage Leather Jacket',
    description: 'Classic brown leather jacket in excellent condition',
    price: 89.99,
    quantity: 1,
    images: ['https://picsum.photos/400/400?random=1'],
    platforms: ['ebay', 'depop'],
    syncStatus: 'synced',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Handmade Ceramic Mug Set',
    description: 'Set of 4 artisan ceramic mugs with unique glaze patterns',
    price: 45.00,
    quantity: 3,
    images: ['https://picsum.photos/400/400?random=2'],
    platforms: ['etsy'],
    syncStatus: 'synced',
    createdAt: '2026-03-14T14:30:00Z',
    updatedAt: '2026-03-14T14:30:00Z',
  },
  {
    id: '3',
    title: 'Nike Air Max Sneakers',
    description: 'Size 10, gently used, authentic Nike sneakers',
    price: 65.00,
    quantity: 1,
    images: ['https://picsum.photos/400/400?random=3'],
    platforms: ['poshmark', 'facebook'],
    syncStatus: 'pending',
    createdAt: '2026-03-16T09:15:00Z',
    updatedAt: '2026-03-17T16:20:00Z',
  },
  {
    id: '4',
    title: 'Vintage Band T-Shirt',
    description: 'Rare 90s concert tee, size M, excellent condition',
    price: 35.00,
    quantity: 1,
    images: ['https://picsum.photos/400/400?random=4'],
    platforms: ['depop', 'ebay'],
    syncStatus: 'synced',
    createdAt: '2026-03-13T11:00:00Z',
    updatedAt: '2026-03-13T11:00:00Z',
  },
  {
    id: '5',
    title: 'Wooden Plant Stand',
    description: 'Mid-century modern style plant stand, solid wood',
    price: 55.00,
    quantity: 2,
    images: ['https://picsum.photos/400/400?random=5'],
    platforms: ['facebook', 'etsy'],
    syncStatus: 'error',
    createdAt: '2026-03-12T08:45:00Z',
    updatedAt: '2026-03-17T12:00:00Z',
  },
];

const mockPlatforms: PlatformConnection[] = [
  { id: '1', name: 'ebay', enabled: true, lastSync: '2026-03-18T00:45:00Z' },
  { id: '2', name: 'etsy', enabled: true, lastSync: '2026-03-18T00:45:00Z' },
  { id: '3', name: 'depop', enabled: true, lastSync: '2026-03-18T00:30:00Z' },
  { id: '4', name: 'poshmark', enabled: false },
  { id: '5', name: 'facebook', enabled: true, lastSync: '2026-03-17T23:50:00Z' },
];

export const useAppStore = create<AppState>((set) => ({
  listings: mockListings,
  platforms: mockPlatforms,
  isOnline: true,
  isSyncing: false,

  addListing: (listing) => {
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    set((state) => ({
      listings: [newListing, ...state.listings],
    }));
  },

  updateListing: (id, updates) => {
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === id
          ? { ...listing, ...updates, updatedAt: new Date().toISOString() }
          : listing
      ),
    }));
  },

  deleteListing: (id) => {
    set((state) => ({
      listings: state.listings.filter((listing) => listing.id !== id),
    }));
  },

  togglePlatform: (platformId) => {
    set((state) => ({
      platforms: state.platforms.map((platform) =>
        platform.id === platformId
          ? { ...platform, enabled: !platform.enabled }
          : platform
      ),
    }));
  },

  triggerSync: async () => {
    set({ isSyncing: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    set((state) => ({
      isSyncing: false,
      listings: state.listings.map((listing) => ({
        ...listing,
        syncStatus: 'synced',
      })),
      platforms: state.platforms.map((platform) =>
        platform.enabled
          ? { ...platform, lastSync: new Date().toISOString() }
          : platform
      ),
    }));
  },
}));
