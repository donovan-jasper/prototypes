import { create } from 'zustand';
import { WardrobeItem, Outfit } from '@/types';
import * as db from '@/lib/database';

interface WardrobeStore {
  items: WardrobeItem[];
  outfits: Outfit[];
  loading: boolean;
  loadItems: (category?: string) => Promise<void>;
  loadOutfits: () => Promise<void>;
  addItem: (item: Omit<WardrobeItem, 'id' | 'wearCount'>) => Promise<WardrobeItem>;
  updateItem: (id: number, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  addOutfit: (outfit: Omit<Outfit, 'id'>) => Promise<Outfit>;
  deleteOutfit: (id: number) => Promise<void>;
}

export const useWardrobeStore = create<WardrobeStore>((set, get) => ({
  items: [],
  outfits: [],
  loading: false,

  loadItems: async (category?: string) => {
    set({ loading: true });
    try {
      const items = await db.getItems(category as any);
      set({ items, loading: false });
    } catch (error) {
      console.error('Failed to load items:', error);
      set({ loading: false });
    }
  },

  loadOutfits: async () => {
    set({ loading: true });
    try {
      const outfits = await db.getOutfits();
      set({ outfits, loading: false });
    } catch (error) {
      console.error('Failed to load outfits:', error);
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const newItem = await db.addItem(item);
    set({ items: [newItem, ...get().items] });
    return newItem;
  },

  updateItem: async (id, updates) => {
    await db.updateItem(id, updates);
    set({
      items: get().items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  },

  deleteItem: async (id) => {
    await db.deleteItem(id);
    set({ items: get().items.filter(item => item.id !== id) });
  },

  addOutfit: async (outfit) => {
    const newOutfit = await db.addOutfit(outfit);
    set({ outfits: [newOutfit, ...get().outfits] });
    return newOutfit;
  },

  deleteOutfit: async (id) => {
    await db.deleteOutfit(id);
    set({ outfits: get().outfits.filter(outfit => outfit.id !== id) });
  }
}));
