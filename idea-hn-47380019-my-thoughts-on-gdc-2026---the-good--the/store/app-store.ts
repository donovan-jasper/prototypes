import { create } from 'zustand';
import { getUserProfile, updateUserProfile } from '../lib/database';

interface User {
  premiumStatus: boolean;
  generationCount: number;
  totalScore: number;
  balance: number;
}

interface AppState {
  user: User;
  isLoading: boolean;
  error: string | null;
  initializeUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: {
    premiumStatus: false,
    generationCount: 0,
    totalScore: 0,
    balance: 0
  },
  isLoading: false,
  error: null,

  initializeUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const userProfile = await getUserProfile();
      set({
        user: {
          premiumStatus: userProfile.premiumStatus,
          generationCount: userProfile.generationCount,
          totalScore: userProfile.totalScore,
          balance: userProfile.balance
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error initializing user:', error);
      set({
        error: 'Failed to load user data',
        isLoading: false
      });
    }
  },

  updateUser: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      // Update in database
      await updateUserProfile(updates);

      // Update in state
      set((state) => ({
        user: {
          ...state.user,
          ...updates
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      set({
        error: 'Failed to update user data',
        isLoading: false
      });
    }
  }
}));
