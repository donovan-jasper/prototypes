import { create } from 'zustand';
import { fetchFortniteInventory, fetchGenshinImpactInventory, fetchDestiny2Inventory } from '../api/gameApis';
import { getItemsByGame, getAllItems, getGameByName, insertItem } from '../db';

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
    const dbItems = await getAllItems();
    
    if (dbItems.length === 0) {
      const fortniteGame = await getGameByName('Fortnite');
      const genshinGame = await getGameByName('Genshin Impact');
      const destinyGame = await getGameByName('Destiny 2');
      
      const fortniteItems = await fetchFortniteInventory();
      const genshinItems = await fetchGenshinImpactInventory();
      const destinyItems = await fetchDestiny2Inventory();
      
      for (const item of fortniteItems) {
        await insertItem({
          name: item.name,
          game_id: fortniteGame.id,
          rarity: item.rarity,
          value: item.value
        });
      }
      
      for (const item of genshinItems) {
        await insertItem({
          name: item.name,
          game_id: genshinGame.id,
          rarity: item.rarity,
          value: item.value
        });
      }
      
      for (const item of destinyItems) {
        await insertItem({
          name: item.name,
          game_id: destinyGame.id,
          rarity: item.rarity,
          value: item.value
        });
      }
      
      const allItems = [...fortniteItems, ...genshinItems, ...destinyItems];
      const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);
      set({ items: allItems, totalValue });
    } else {
      const fortniteGame = await getGameByName('Fortnite');
      const genshinGame = await getGameByName('Genshin Impact');
      const destinyGame = await getGameByName('Destiny 2');
      
      const fortniteItems = await getItemsByGame(fortniteGame.id);
      const genshinItems = await getItemsByGame(genshinGame.id);
      const destinyItems = await getItemsByGame(destinyGame.id);
      
      const allItems = [
        ...fortniteItems.map(item => ({ ...item, id: String(item.id), game: 'Fortnite' })),
        ...genshinItems.map(item => ({ ...item, id: String(item.id), game: 'Genshin Impact' })),
        ...destinyItems.map(item => ({ ...item, id: String(item.id), game: 'Destiny 2' }))
      ];
      
      const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);
      set({ items: allItems, totalValue });
    }
  },
}));

export { useInventoryStore };
