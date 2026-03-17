import create from 'zustand';
import { getSnapshots, saveSnapshot } from '../storage/sqlite';

const useSnapshots = create((set) => ({
  snapshots: [],
  loading: false,

  loadSnapshots: async () => {
    set({ loading: true });
    try {
      const snapshots = await getSnapshots();
      set({ snapshots, loading: false });
    } catch (error) {
      console.error('Failed to load snapshots', error);
      set({ loading: false });
    }
  },

  addSnapshot: async (snapshot) => {
    // Save to local SQLite database
    await saveSnapshot(snapshot);

    // Update Zustand store
    set((state) => ({
      snapshots: [...state.snapshots, snapshot]
    }));
  },

  getSnapshotById: (id) => {
    const state = useSnapshots.getState();
    return state.snapshots.find(snapshot => snapshot.id === id);
  }
}));

export default useSnapshots;
