import { create } from 'zustand';
import { Shelf } from '../db/schema';

interface ShelfWithCount extends Shelf {
  item_count: number;
}

interface ShelvesState {
  shelves: ShelfWithCount[];
  loading: boolean;
  error: string | null;
  setShelves: (shelves: ShelfWithCount[]) => void;
  addShelf: (shelf: ShelfWithCount) => void;
  updateShelf: (id: number, data: Partial<Shelf>) => void;
  deleteShelf: (id: number) => void;
  reorderShelves: (shelfIds: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useShelvesStore = create<ShelvesState>((set) => ({
  shelves: [],
  loading: false,
  error: null,
  
  setShelves: (shelves) => set({ shelves, loading: false, error: null }),
  
  addShelf: (shelf) => set((state) => ({
    shelves: [...state.shelves, shelf],
  })),
  
  updateShelf: (id, data) => set((state) => ({
    shelves: state.shelves.map((shelf) =>
      shelf.id === id ? { ...shelf, ...data, updated_at: new Date().toISOString() } : shelf
    ),
  })),
  
  deleteShelf: (id) => set((state) => ({
    shelves: state.shelves.filter((shelf) => shelf.id !== id),
  })),
  
  reorderShelves: (shelfIds) => set((state) => {
    const shelfMap = new Map(state.shelves.map((s) => [s.id, s]));
    const reordered = shelfIds
      .map((id, index) => {
        const shelf = shelfMap.get(id);
        return shelf ? { ...shelf, order_index: index } : null;
      })
      .filter((s): s is ShelfWithCount => s !== null);
    return { shelves: reordered };
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
}));
