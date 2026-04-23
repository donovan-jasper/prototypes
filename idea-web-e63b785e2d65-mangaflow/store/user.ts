import { create } from 'zustand';

interface UserState {
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false, // Default to free tier
  setPremiumStatus: (status) => set({ isPremium: status }),
}));
