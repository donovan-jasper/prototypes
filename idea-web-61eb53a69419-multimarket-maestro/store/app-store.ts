import { create } from 'zustand';
import { Listing, Platform } from '../types';
import { SyncEngine } from '../lib/sync-engine';
import { EbayAdapter } from '../lib/platform-adapters/ebay-adapter';
import { EtsyAdapter } from '../lib/platform-adapters/etsy-adapter';
import { DepopAdapter } from '../lib/platform-adapters/depop-adapter';
import { SecureStorage } from '../lib/storage';

interface AppState {
  listings: Listing[];
  platforms: Platform[];
  syncStatus: 'idle' | 'syncing' | 'synced' | 'pending' | 'error';
  isOnline: boolean;
  syncEngine: SyncEngine;
  initialize: () => Promise<void>;
  addListing: (listing: Listing) => Promise<void>;
  updateListing: (listing: Listing) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  setSyncStatus: (status: AppState['syncStatus']) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  triggerSync: () => Promise<void>;
  togglePlatform: (platformId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  listings: [],
  platforms: [
    { id: '1', name: 'ebay', enabled: false, lastSync: undefined },
    { id: '2', name: 'etsy', enabled: false, lastSync: undefined },
    { id: '3', name: 'depop', enabled: false, lastSync: undefined },
    { id: '4', name: 'poshmark', enabled: false, lastSync: undefined },
    { id: '5', name: 'facebook', enabled: false, lastSync: undefined },
  ],
  syncStatus: 'idle',
  isOnline: true,
  syncEngine: new SyncEngine(),

  initialize: async () => {
    const { syncEngine } = get();

    // Initialize platform adapters
    const ebayAdapter = new EbayAdapter();
    const etsyAdapter = new EtsyAdapter();
    const depopAdapter = new DepopAdapter();

    syncEngine.registerAdapter('ebay', ebayAdapter);
    syncEngine.registerAdapter('etsy', etsyAdapter);
    syncEngine.registerAdapter('depop', depopAdapter);

    // Check which platforms are connected
    await get().checkConnectedPlatforms();

    // Load initial data
    await get().loadListings();

    // Start initial sync
    await get().triggerSync();
  },

  checkConnectedPlatforms: async () => {
    const platforms = get().platforms.map(async (platform) => {
      const token = await SecureStorage.getToken(platform.name);
      return {
        ...platform,
        enabled: !!token,
      };
    });

    const updatedPlatforms = await Promise.all(platforms);
    set({ platforms: updatedPlatforms });
  },

  loadListings: async () => {
    // In a real app, this would load from database
    // For now, we'll use mock data
    const mockListings: Listing[] = [
      {
        id: '1',
        title: 'Vintage Watch',
        description: 'Beautiful vintage watch in excellent condition',
        price: 199.99,
        quantity: 5,
        images: ['https://example.com/watch1.jpg'],
        platforms: ['ebay', 'etsy'],
        syncStatus: 'synced',
        attributes: { brand: 'Rolex', condition: 'used' }
      },
      {
        id: '2',
        title: 'Retro Sunglasses',
        description: 'Classic retro sunglasses',
        price: 49.99,
        quantity: 10,
        images: ['https://example.com/sunglasses1.jpg'],
        platforms: ['depop'],
        syncStatus: 'synced',
        attributes: { brand: 'Ray-Ban', condition: 'new' }
      }
    ];

    set({ listings: mockListings });
  },

  addListing: async (listing) => {
    const { isOnline, syncEngine } = get();

    set(state => ({
      listings: [...state.listings, listing],
      syncStatus: isOnline ? 'syncing' : 'pending'
    }));

    try {
      if (isOnline) {
        // If online, sync immediately
        await syncEngine.syncAll();
        set({ syncStatus: 'synced' });
      } else {
        // If offline, queue the change
        await syncEngine.queueChange({
          listingId: listing.id,
          platform: 'all', // Will be expanded to individual platforms
          action: 'create',
          listing,
          status: 'pending'
        });
      }
    } catch (error) {
      set({ syncStatus: 'error' });
      throw error;
    }
  },

  updateListing: async (listing) => {
    const { isOnline, syncEngine } = get();

    set(state => ({
      listings: state.listings.map(l => l.id === listing.id ? listing : l),
      syncStatus: isOnline ? 'syncing' : 'pending'
    }));

    try {
      if (isOnline) {
        // If online, sync immediately
        await syncEngine.syncAll();
        set({ syncStatus: 'synced' });
      } else {
        // If offline, queue the change
        await syncEngine.queueChange({
          listingId: listing.id,
          platform: 'all', // Will be expanded to individual platforms
          action: 'update',
          listing,
          status: 'pending'
        });
      }
    } catch (error) {
      set({ syncStatus: 'error' });
      throw error;
    }
  },

  deleteListing: async (id) => {
    const { isOnline, syncEngine } = get();

    set(state => ({
      listings: state.listings.filter(l => l.id !== id),
      syncStatus: isOnline ? 'syncing' : 'pending'
    }));

    try {
      if (isOnline) {
        // If online, sync immediately
        await syncEngine.syncAll();
        set({ syncStatus: 'synced' });
      } else {
        // If offline, queue the change
        await syncEngine.queueChange({
          listingId: id,
          platform: 'all', // Will be expanded to individual platforms
          action: 'delete',
          listing: null,
          status: 'pending'
        });
      }
    } catch (error) {
      set({ syncStatus: 'error' });
      throw error;
    }
  },

  setSyncStatus: (status) => set({ syncStatus: status }),

  setOnlineStatus: (isOnline) => {
    set({ isOnline });
    if (isOnline) {
      // When coming back online, trigger sync
      get().triggerSync();
    }
  },

  triggerSync: async () => {
    const { syncEngine, isOnline } = get();

    if (!isOnline) {
      set({ syncStatus: 'pending' });
      return;
    }

    set({ syncStatus: 'syncing' });

    try {
      await syncEngine.syncAll();
      set({ syncStatus: 'synced' });
    } catch (error) {
      set({ syncStatus: 'error' });
      throw error;
    }
  },

  togglePlatform: (platformId) => {
    set(state => ({
      platforms: state.platforms.map(platform =>
        platform.id === platformId
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    }));
  },
}));
