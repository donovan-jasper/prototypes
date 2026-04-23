import { create } from 'zustand';
import { getItemsFromDB, updateItemValue, getItemById } from '../db';
import { fetchItemPrice } from '../api/priceService';

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
  imageUrl?: string;
}

interface InventoryStore {
  items: Item[];
  totalValue: number;
  selectedGame: string | null;
  syncFromDB: () => Promise<void>;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateItemValue: (itemId: string, newValue: number) => void;
  refreshItemPrice: (itemId: string) => Promise<void>;
  setSelectedGame: (game: string | null) => void;
}

const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  totalValue: 0,
  selectedGame: null,

  syncFromDB: async () => {
    try {
      const items = await getItemsFromDB();
      const totalValue = items.reduce((sum, item) => sum + item.value, 0);

      set({
        items,
        totalValue
      });
    } catch (error) {
      console.error('Error syncing inventory from DB:', error);
    }
  },

  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    totalValue: state.totalValue + item.value
  })),

  removeItem: (itemId) => set((state) => {
    const itemToRemove = state.items.find(item => item.id === itemId);
    if (!itemToRemove) return state;

    return {
      items: state.items.filter(item => item.id !== itemId),
      totalValue: state.totalValue - itemToRemove.value
    };
  }),

  updateItemValue: (itemId, newValue) => set((state) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, value: newValue } : item
    );

    const totalValue = updatedItems.reduce((sum, item) => sum + item.value, 0);

    // Update in database
    updateItemValue(itemId, newValue);

    return {
      items: updatedItems,
      totalValue
    };
  }),

  refreshItemPrice: async (itemId) => {
    try {
      const item = await getItemById(itemId);
      if (!item) return;

      const newPrice = await fetchItemPrice(item.game, item.id);

      set((state) => {
        const updatedItems = state.items.map(i =>
          i.id === itemId ? { ...i, value: newPrice } : i
        );

        const totalValue = updatedItems.reduce((sum, i) => sum + i.value, 0);

        // Update in database
        updateItemValue(itemId, newPrice);

        return {
          items: updatedItems,
          totalValue
        };
      });
    } catch (error) {
      console.error('Error refreshing item price:', error);
    }
  },

  setSelectedGame: (game) => set({ selectedGame: game }),
}));

export { useInventoryStore };
