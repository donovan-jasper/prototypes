import { create } from 'zustand';
import { User, Generation } from '../types';
import { getUserProfile, updateUserProfile, getGenerations } from '../lib/database';

interface AppState {
  user: User;
  generations: Generation[];
  isGenerating: boolean;
  loadData: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addGeneration: (generation: Generation) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: {
    premiumStatus: false,
    generationCount: 0,
    totalScore: 0,
    balance: 0,
  },
  generations: [],
  isGenerating: false,

  loadData: async () => {
    try {
      const userProfile = await getUserProfile();
      const generations = await getGenerations();

      set({
        user: {
          premiumStatus: userProfile?.premiumStatus || false,
          generationCount: userProfile?.generationCount || 0,
          totalScore: userProfile?.totalScore || 0,
          balance: userProfile?.balance || 0,
        },
        generations,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },

  updateUser: async (updates) => {
    try {
      const currentUser = get().user;
      const updatedUser = { ...currentUser, ...updates };

      await updateUserProfile(updatedUser);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  addGeneration: (generation) => {
    set(state => ({
      generations: [generation, ...state.generations],
      user: {
        ...state.user,
        generationCount: state.user.generationCount + 1,
      }
    }));
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },
}));
