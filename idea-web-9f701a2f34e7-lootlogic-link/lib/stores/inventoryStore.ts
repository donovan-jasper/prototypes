import { create } from 'zustand';
import { fetchFortniteInventory, fetchGenshinImpactInventory, fetchDestiny2Inventory } from '../api/gameApis';

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
}

interface InventoryStore {
  items: Item[];
  totalValue: number;
  selectedGame: string | null;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  syncFromDB: () => Promise<void>;
}

const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  totalValue: 0,
  selectedGame: null,
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    totalValue: state.totalValue + item.value,
  })),
  removeItem: (itemId) => set((state) => {
    const itemToRemove = state.items.find(item => item.id === itemId);
    return {
      items: state.items.filter(item => item.id !== itemId),
      totalValue: state.totalValue - (itemToRemove?.value || 0),
    };
  }),
  syncFromDB: async () => {
    const fortniteItems = await fetchFortniteInventory();
    const genshinItems = await fetchGenshinImpactInventory();
    const destinyItems = await fetchDestiny2Inventory();
    const allItems = [...fortniteItems, ...genshinItems, ...destinyItems];
    const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);
    set({ items: allItems, totalValue });
  },
}));

export { useInventoryStore };
