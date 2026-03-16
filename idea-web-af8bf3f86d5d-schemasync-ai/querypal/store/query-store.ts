import { create } from 'zustand';

interface Query {
  id: number;
  databaseId: string;
  query: string;
  results: any[];
  timestamp: Date;
  isFavorite: boolean;
}

interface QueryState {
  queries: Query[];
  addQuery: (query: Omit<Query, 'id' | 'timestamp' | 'isFavorite'>) => void;
  toggleFavorite: (id: number) => void;
  clearHistory: () => void;
}

export const useQueryStore = create<QueryState>((set) => ({
  queries: [],

  addQuery: (query) => {
    set(state => ({
      queries: [
        ...state.queries,
        {
          ...query,
          id: Date.now(),
          timestamp: new Date(),
          isFavorite: false,
        },
      ],
    }));
  },

  toggleFavorite: (id) => {
    set(state => ({
      queries: state.queries.map(q =>
        q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
      ),
    }));
  },

  clearHistory: () => {
    set({ queries: [] });
  },
}));
