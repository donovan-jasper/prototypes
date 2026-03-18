import { create } from 'zustand';
import * as db from '@/lib/database';

interface UserStore {
  isPro: boolean;
  favoriteColors: string[];
  stylePreference: 'casual' | 'formal' | 'mixed';
  onboardingComplete: boolean;
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<any>) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  isPro: false,
  favoriteColors: [],
  stylePreference: 'mixed',
  onboardingComplete: false,

  loadPreferences: async () => {
    const prefs = await db.getUserPreferences();
    if (prefs) {
      set(prefs);
    }
  },

  updatePreferences: async (updates) => {
    await db.updateUserPreferences(updates);
    set(updates);
  }
}));
