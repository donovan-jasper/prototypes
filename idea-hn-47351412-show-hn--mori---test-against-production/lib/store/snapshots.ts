import { create } from 'zustand';
import { getSnapshots } from '../database/snapshot';

const useSnapshot = create((set) => ({
  snapshots: [],
  getSnapshot: async (id) => {
    const snapshot = await getSnapshots(id);
    set({ snapshot });
    return snapshot;
  },
}));

export { useSnapshot };
