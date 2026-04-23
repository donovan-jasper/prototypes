import { create } from 'zustand';
import { Listing, Platform, Order } from '../types';
import { SyncEngine } from '../lib/sync-engine';
import { EbayAdapter } from '../lib/platform-adapters/ebay-adapter';
import { EtsyAdapter } from '../lib/platform-adapters/etsy-adapter';
import { DepopAdapter } from '../lib/platform-adapters/depop-adapter';
import { SecureStorage } from '../lib/storage';
import { initDatabase, getListings, getPlatforms, updatePlatform } from '../lib/database';

interface AppState {
  listings: Listing[];
  platforms: Platform[];
  orders: Order[];
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
  togglePlatform: (platformId: string) => Promise<void>;
  loadListings: () => Promise<void>;
  loadPlatforms: () => Promise<void>;
  loadOrders: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  listings: [],
  platforms: [],
  orders: [],
  syncStatus: 'idle',
  isOnline: true,
  syncEngine: new SyncEngine(),

  initialize: async () => {
    const { syncEngine } = get();

    // Initialize database
    await initDatabase();

    // Initialize platform adapters
    const ebayAdapter = new EbayAdapter();
    const etsyAdapter = new EtsyAdapter();
    const depopAdapter = new DepopAdapter();

    syncEngine.registerAdapter('ebay', ebayAdapter);
    syncEngine.registerAdapter('etsy', etsyAdapter);
    syncEngine.registerAdapter('depop', depopAdapter);

    // Load initial data
    await get().loadPlatforms();
    await get().loadListings();
    await get().loadOrders();

    // Start initial sync
    await get().triggerSync();
  },

  loadPlatforms: async () => {
    const platforms = await getPlatforms();
    set({ platforms });
  },

  loadListings: async () => {
    const listings = await getListings();
    set({ listings });
  },

  loadOrders: async () => {
    // In a real app, this would load orders from database
    // For now, we'll initialize with empty array
    set({ orders: [] });
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
          listing: undefined,
          status: 'pending'
        });
      }
    } catch (error) {
      set({ syncStatus: 'error' });
      throw error;
    }
  },

  setSyncStatus: (status) => set({ syncStatus: status }),

  setOnlineStatus: (isOnline) => set({ isOnline }),

  triggerSync: async () => {
    const { syncEngine } = get();
    set({ syncStatus: 'syncing' });
    await syncEngine.syncAll();
  },

  togglePlatform: async (platformId) => {
    const { platforms } = get();
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    const updatedPlatform = { ...platform, enabled: !platform.enabled };
    await updatePlatform(updatedPlatform);

    set(state => ({
      platforms: state.platforms.map(p => p.id === platformId ? updatedPlatform : p)
    }));

    // Trigger sync if platform was enabled
    if (updatedPlatform.enabled) {
      await get().triggerSync();
    }
  }
}));
