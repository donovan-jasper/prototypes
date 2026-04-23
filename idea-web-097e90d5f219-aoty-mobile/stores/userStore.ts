import { create } from 'zustand';

interface UserStore {
  isPremium: boolean;
  setPremiumStatus: (isPremium: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isPremium: false,

  setPremiumStatus: (isPremium) => {
    set({ isPremium });
  },
}));
