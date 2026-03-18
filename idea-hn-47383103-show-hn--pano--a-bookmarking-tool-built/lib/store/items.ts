import { create } from 'zustand';
import { Item } from '../db/schema';

interface ItemsState {
  items: Record<number, Item[]>;
  loading: boolean;
  error: string | null;
  setItems: (shelfId: number, items: Item[]) => void;
  addItem: (shelfId: number, item: Item) => void;
  updateItem: (shelfId: number, id: number, data: Partial<Item>) => void;
  deleteItem: (shelfId: number, id: number) => void;
  moveItem: (itemId: number, fromShelfId: number, toShelfId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useItemsStore = create<ItemsState>((set) => ({
  items: {},
  loading: false,
  error: null,
  
  setItems: (shelfId, items) => set((state) => ({
    items: { ...state.items, [shelfId]: items },
    loading: false,
    error: null,
  })),
  
  addItem: (shelfId, item) => set((state) => ({
    items: {
      ...state.items,
      [shelfId]: [item, ...(state.items[shelfId] || [])],
    },
  })),
  
  updateItem: (shelfId, id, data) => set((state) => ({
    items: {
      ...state.items,
      [shelfId]: (state.items[shelfId] || []).map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    },
  })),
  
  deleteItem: (shelfId, id) => set((state) => ({
    items: {
      ...state.items,
      [shelfId]: (state.items[shelfId] || []).filter((item) => item.id !== id),
    },
  })),
  
  moveItem: (itemId, fromShelfId, toShelfId) => set((state) => {
    const item = (state.items[fromShelfId] || []).find((i) => i.id === itemId);
    if (!item) return state;

    const movedItem = { ...item, shelf_id: toShelfId };

    return {
      items: {
        ...state.items,
        [fromShelfId]: (state.items[fromShelfId] || []).filter((i) => i.id !== itemId),
        [toShelfId]: [movedItem, ...(state.items[toShelfId] || [])],
      },
    };
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
}));
