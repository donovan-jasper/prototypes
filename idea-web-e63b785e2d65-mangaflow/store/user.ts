import { create } from 'zustand';
import { checkPremiumStatus, initializeRevenueCat } from '../lib/premium';

interface UserState {
  isPremium: boolean;
  expirationDate?: number;
  isLoading: boolean;
  setPremiumStatus: (status: boolean, expirationDate?: number) => void;
  initializePremiumStatus: () => Promise<void>;
  initializeRevenueCat: (apiKey: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  expirationDate: undefined,
  isLoading: true,

  setPremiumStatus: (status, expirationDate) => set({
    isPremium: status,
    expirationDate
  }),

  initializePremiumStatus: async () => {
    try {
      set({ isLoading: true });
      const { isPremium, expirationDate } = await checkPremiumStatus();
      set({ isPremium, expirationDate, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize premium status:', error);
      set({ isLoading: false });
    }
  },

  initializeRevenueCat: async (apiKey: string) => {
    try {
      await initializeRevenueCat(apiKey);
      await this.initializePremiumStatus();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  },
}));
