import { create } from 'zustand';
import { databaseService } from '../services/databaseService';

interface UserState {
  isPremium: boolean;
  hasCompletedOnboarding: boolean;
  togglePremium: () => void;
  completeOnboarding: () => void;
  loadPreferences: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  hasCompletedOnboarding: false,

  togglePremium: () => {
    set((state) => ({ isPremium: !state.isPremium }));
    databaseService.savePreference('isPremium', JSON.stringify(!useUserStore.getState().isPremium));
  },

  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
    databaseService.savePreference('hasCompletedOnboarding', 'true');
  },

  loadPreferences: async () => {
    const isPremium = await databaseService.getPreference('isPremium');
    const hasCompletedOnboarding = await databaseService.getPreference('hasCompletedOnboarding');

    set({
      isPremium: isPremium ? JSON.parse(isPremium) : false,
      hasCompletedOnboarding: hasCompletedOnboarding === 'true',
    });
  },
}));
