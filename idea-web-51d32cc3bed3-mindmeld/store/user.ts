import { create } from 'zustand';

interface UserState {
  isPremium: boolean;
  setPremium: (isPremium: boolean) => void;
}

export const useUser = create<UserState>((set) => ({
  isPremium: false,
  setPremium: (isPremium) => set({ isPremium }),
}));
