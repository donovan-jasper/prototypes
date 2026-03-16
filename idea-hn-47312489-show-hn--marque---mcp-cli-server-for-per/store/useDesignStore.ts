import { create } from 'zustand';
import { initDB, createSystem, getSystem, updateSystem, deleteSystem, listSystems } from '../lib/db';

initDB();

const useDesignStore = create((set) => ({
  systems: [],
  currentSystem: null,
  isLoading: false,
  error: null,

  loadSystems: async () => {
    set({ isLoading: true, error: null });
    try {
      listSystems((systems) => {
        set({ systems, isLoading: false });
      });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  selectSystem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      getSystem(id, (system) => {
        set({
          currentSystem: {
            ...system,
            colors: JSON.parse(system.colors),
            typography: JSON.parse(system.typography),
            spacing: JSON.parse(system.spacing),
          },
          isLoading: false,
        });
      });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  saveSystem: async (system) => {
    set({ isLoading: true, error: null });
    try {
      if (system.id) {
        updateSystem(system, (success) => {
          if (success) {
            set((state) => ({
              systems: state.systems.map((s) =>
                s.id === system.id ? system : s
              ),
              isLoading: false,
            }));
          }
        });
      } else {
        createSystem(system, (id) => {
          set((state) => ({
            systems: [...state.systems, { ...system, id }],
            isLoading: false,
          }));
        });
      }
    } catch (error) {
      set({ error, isLoading: false });
    }
  },

  deleteSystem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      deleteSystem(id, (success) => {
        if (success) {
          set((state) => ({
            systems: state.systems.filter((s) => s.id !== id),
            isLoading: false,
          }));
        }
      });
    } catch (error) {
      set({ error, isLoading: false });
    }
  },
}));

export default useDesignStore;
