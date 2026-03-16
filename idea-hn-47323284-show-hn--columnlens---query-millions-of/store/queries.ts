import { create } from 'zustand';

interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  lastRun: number;
}

interface QueriesStore {
  queries: SavedQuery[];
  addQuery: (query: SavedQuery) => void;
  removeQuery: (id: string) => void;
}

export const useQueriesStore = create<QueriesStore>((set) => ({
  queries: [],
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  removeQuery: (id) => set((state) => ({ queries: state.queries.filter(q => q.id !== id) }))
}));
