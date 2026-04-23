import { create } from 'zustand';
import { getItems, addItem as dbAddItem, deleteItem as dbDeleteItem } from '@/lib/db';
import { SavedItem, Collection } from '@/types';

interface StoreState {
  items: SavedItem[];
  collections: Collection[];
  isLoading: boolean;
  fetchItems: (filter?: { type?: string; collectionId?: number; search?: string }) => Promise<void>;
  addItem: (item: Omit<SavedItem, 'id'>) => Promise<number>;
  removeItem: (id: number) => Promise<void>;
  fetchCollections: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  items: [],
  collections: [],
  isLoading: false,

  fetchItems: async (filter) => {
    set({ isLoading: true });
    try {
      const items = await getItems(filter);
      set({ items });
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    try {
      const id = await dbAddItem(item);
      set((state) => ({
        items: [{ ...item, id }, ...state.items],
      }));
      return id;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  removeItem: async (id) => {
    try {
      await dbDeleteItem(id);
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
      }));
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  },

  fetchCollections: async () => {
    set({ isLoading: true });
    try {
      const collections = await getCollections();
      set({ collections });
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
