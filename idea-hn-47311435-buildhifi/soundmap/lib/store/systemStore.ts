import create from 'zustand';
import { persist } from 'zustand/middleware';
import { saveSystem, getUserSystems } from '../database/queries';

export const useSystemStore = create(
  persist(
    (set, get) => ({
      currentSystem: null,
      components: [],
      systems: [],
      isPremium: false,

      addComponent: (component) =>
        set((state) => ({
          components: [...state.components, component],
        })),

      removeComponent: (id) =>
        set((state) => ({
          components: state.components.filter((component) => component.id !== id),
        })),

      saveSystem: async (name) => {
        const { components, isPremium } = get();
        if (!isPremium && get().systems.length >= 1) {
          alert('Free tier allows only one system. Upgrade to Premium for unlimited systems.');
          return;
        }
        const system = {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          components,
        };
        await saveSystem(system);
        set((state) => ({
          systems: [...state.systems, system],
          currentSystem: system,
        }));
      },

      loadSystem: async (id) => {
        const systems = await getUserSystems();
        const system = systems.find((s) => s.id === id);
        if (system) {
          set({
            currentSystem: system,
            components: system.components,
          });
        }
      },

      setPremium: (isPremium) =>
        set({ isPremium }),
    }),
    {
      name: 'system-storage',
      getStorage: () => require('expo-sqlite').openDatabase('soundmap.db'),
    }
  )
);
