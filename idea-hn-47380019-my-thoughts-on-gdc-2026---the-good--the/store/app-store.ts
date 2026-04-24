import { create } from 'zustand';
import { User } from '../types';

interface AppState {
  user: User;
  updateUser: (updates: Partial<User>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: {
    premiumStatus: false,
    generationCount: 0,
    totalScore: 0,
    balance: 0,
  },
  updateUser: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
}));
