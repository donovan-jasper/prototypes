import create from 'zustand';
import { getConnections, saveConnection } from '../storage/sqlite';

const useConnections = create((set) => ({
  connections: [],
  loading: false,

  loadConnections: async () => {
    set({ loading: true });
    try {
      const connections = await getConnections();
      set({ connections, loading: false });
    } catch (error) {
      console.error('Failed to load connections', error);
      set({ loading: false });
    }
  },

  addConnection: async (connection) => {
    await saveConnection(connection);
    set((state) => ({ connections: [...state.connections, connection] }));
  },
}));

export default useConnections;
