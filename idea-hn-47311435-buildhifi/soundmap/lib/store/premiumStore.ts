import create from 'zustand';
import { persist } from 'zustand/middleware';

export const usePremiumStore = create(
  persist(
    (set) => ({
      isPremium: false,
      purchaseDate: null,

      unlockPremium: () =>
        set({
          isPremium: true,
          purchaseDate: new Date().toISOString(),
        }),

      checkFeatureAccess: (feature) => {
        const { isPremium } = get();
        if (!isPremium && feature === 'unlimitedSystems') {
          return false;
        }
        return true;
      },
    }),
    {
      name: 'premium-storage',
      getStorage: () => require('expo-sqlite').openDatabase('soundmap.db'),
    }
  )
);
