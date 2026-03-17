import { create } from 'zustand';

interface UserState {
  searchesRemaining: number;
  isPremium: boolean;
  decrementSearches: () => void;
  resetSearches: () => void;
  setPremiumStatus: (isPremium: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  searchesRemaining: 5,
  isPremium: false,
  decrementSearches: () => set((state) => ({
    searchesRemaining: Math.max(0, state.searchesRemaining - 1)
  })),
  resetSearches: () => set({ searchesRemaining: 5 }),
  setPremiumStatus: (isPremium) => set({ isPremium }),
}));
