import { create } from 'zustand';
import { checkPremiumStatus } from '../lib/premium';

interface UserState {
  isPremium: boolean;
  expirationDate?: number;
  setPremiumStatus: (status: boolean, expirationDate?: number) => void;
  initializePremiumStatus: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  expirationDate: undefined,

  setPremiumStatus: (status, expirationDate) => set({
    isPremium: status,
    expirationDate
  }),

  initializePremiumStatus: async () => {
    try {
      const { isPremium, expirationDate } = await checkPremiumStatus();
      set({ isPremium, expirationDate });
    } catch (error) {
      console.error('Failed to initialize premium status:', error);
    }
  },
}));
