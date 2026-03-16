import create from 'zustand';
import { getQueryHistory, saveQuery } from '../storage/sqlite';

const useQueries = create((set) => ({
  queries: [],
  loading: false,

  loadQueries: async (snapshotId) => {
    set({ loading: true });
    try {
      const queries = await getQueryHistory(snapshotId);
      set({ queries, loading: false });
    } catch (error) {
      console.error('Failed to load queries', error);
      set({ loading: false });
    }
  },

  addQuery: async (query) => {
    await saveQuery(query);
    set((state) => ({ queries: [query, ...state.queries] }));
  },
}));

export default useQueries;
