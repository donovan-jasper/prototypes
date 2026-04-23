import create from 'zustand';
import { getPremiumStatus, setPremiumStatus } from '../lib/storage';

interface PremiumStore {
  isPremium: boolean;
  setPremium: (isPremium: boolean) => Promise<void>;
  checkPremiumStatus: () => Promise<void>;
}

export const usePremiumStore = create<PremiumStore>((set) => ({
  isPremium: false,
  setPremium: async (isPremium) => {
    await setPremiumStatus(isPremium);
    set({ isPremium });
  },
  checkPremiumStatus: async () => {
    const status = await getPremiumStatus();
    set({ isPremium: status });
  },
}));
