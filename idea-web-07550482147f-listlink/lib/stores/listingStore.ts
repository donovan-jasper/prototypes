import { create } from 'zustand';
import { Listing, getListings as dbGetListings, createListing as dbCreateListing, updateListing as dbUpdateListing, deleteListing as dbDeleteListing } from '../database';

interface ListingStore {
  listings: Listing[];
  loading: boolean;
  error: string | null;

  // Actions
  loadListings: (filters?: { status?: string; platform?: string }) => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<string>;
  updateListing: (id: string, updates: Partial<Omit<Listing, 'id' | 'createdAt'>>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  // Selectors
  getListingsByPlatform: (platform: string) => Listing[];
  getListingsByStatus: (status: string) => Listing[];
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  loadListings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const listings = await dbGetListings(filters);
      set({ listings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addListing: async (listing) => {
    set({ loading: true, error: null });
    try {
      const id = await dbCreateListing(listing);
      await get().loadListings();
      set({ loading: false });
      return id;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateListing: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await dbUpdateListing(id, updates);
      await get().loadListings();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ loading: true, error: null });
    try {
      await dbDeleteListing(id);
      await get().loadListings();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getListingsByPlatform: (platform) => {
    return get().listings.filter(listing => listing.platform.includes(platform));
  },

  getListingsByStatus: (status) => {
    return get().listings.filter(listing => listing.status === status);
  },
}));
