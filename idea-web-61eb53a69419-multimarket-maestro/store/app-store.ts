import { create } from 'zustand';
import { Listing, Platform } from '../types';
import { SyncEngine } from '../lib/sync-engine';
import { EbayAdapter } from '../lib/platform-adapters/ebay-adapter';
import { EtsyAdapter } from '../lib/platform-adapters/etsy-adapter';
import { DepopAdapter } from '../lib/platform-adapters/depop-adapter';

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
}

export const useAppStore = create<AppState>((set, get) => ({
  listings: [],
  platforms: [],
  syncStatus: 'idle',
  isOnline: true,
  syncEngine: new SyncEngine(),

  initialize: async () => {
    const { syncEngine } = get();

    // Initialize platform adapters
    const ebayAdapter = new EbayAdapter('your-ebay-api-token');
    const etsyAdapter = new EtsyAdapter('your-etsy-api-token');
    const depopAdapter = new DepopAdapter('your-depop-api-token');

    syncEngine.registerAdapter('ebay', ebayAdapter);
    syncEngine.registerAdapter('etsy', etsyAdapter);
    syncEngine.registerAdapter('depop', depopAdapter);

    // Load initial data
    await get().loadListings();
    await get().loadPlatforms();

    // Start initial sync
    await get().triggerSync();
  },

  loadListings: async () => {
    const listings = await getListings();
    set({ listings });
  },

  loadPlatforms: async () => {
    // In a real app, this would load from database
    const platforms: Platform[] = [
      { id: 1, name: 'ebay', enabled: true },
      { id: 2, name: 'etsy', enabled: true },
      { id: 3, name: 'depop', enabled: true }
    ];
    set({ platforms });
  },

  addListing: async (listing) => {
    const { isOnline, syncEngine } = get();

    if (isOnline) {
      // If online, sync immediately
      await syncEngine.syncAll();
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

    // Update local state
    set(state => ({
      listings: [...state.listings, listing],
      syncStatus: isOnline ? 'synced' : 'pending'
    }));
  },

  updateListing: async (listing) => {
    const { isOnline, syncEngine } = get();

    if (isOnline) {
      // If online, sync immediately
      await syncEngine.syncAll();
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

    // Update local state
    set(state => ({
      listings: state.listings.map(l => l.id === listing.id ? listing : l),
      syncStatus: isOnline ? 'synced' : 'pending'
    }));
  },

  deleteListing: async (id) => {
    const { isOnline, syncEngine } = get();

    if (isOnline) {
      // If online, sync immediately
      await syncEngine.syncAll();
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

    // Update local state
    set(state => ({
      listings: state.listings.filter(l => l.id !== id),
      syncStatus: isOnline ? 'synced' : 'pending'
    }));
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
    const { syncEngine } = get();
    set({ syncStatus: 'syncing' });
    try {
      await syncEngine.syncAll();
      set({ syncStatus: 'synced' });
    } catch (error) {
      console.error('Sync failed:', error);
      set({ syncStatus: 'error' });
    }
  }
}));
