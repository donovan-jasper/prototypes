import { create } from 'zustand';
import { Generation, User } from '../types';
import { getGenerations, saveGeneration, updateUserProfile, getUserProfile } from '../lib/database';
import { calculateEthicalScore } from '../lib/ethical-score';

interface AppState {
  generations: Generation[];
  user: User;
  ethicalScore: number;
  isGenerating: boolean;
  selectedPlatform: string | null;
  loadGenerations: () => Promise<void>;
  addGeneration: (generation: Omit<Generation, 'id'>) => Promise<void>;
  setUser: (user: Partial<User>) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setSelectedPlatform: (platform: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  generations: [],
  user: {
    premiumStatus: false,
    generationCount: 0,
    totalScore: 0
  },
  ethicalScore: 0,
  isGenerating: false,
  selectedPlatform: null,
  
  loadGenerations: async () => {
    try {
      const generations = await getGenerations();
      set({ generations });
      
      // Update ethical score based on loaded generations
      const ethicalScore = calculateEthicalScore(generations);
      set({ ethicalScore });
      
      // Update user profile from DB
      const userProfile = await getUserProfile();
      if (userProfile) {
        set({ 
          user: {
            premiumStatus: !!userProfile.premiumStatus,
            generationCount: userProfile.generationCount,
            totalScore: userProfile.totalScore
          }
        });
      }
    } catch (error) {
      console.error('Error loading generations:', error);
    }
  },
  
  addGeneration: async (generation) => {
    try {
      const id = await saveGeneration(generation);
      const newGeneration = { ...generation, id } as Generation;
      
      // Update local state
      const currentGenerations = get().generations;
      set({ 
        generations: [newGeneration, ...currentGenerations],
        ethicalScore: calculateEthicalScore([newGeneration, ...currentGenerations])
      });
      
      // Update user profile
      const currentUser = get().user;
      const newGenerationCount = currentUser.generationCount + 1;
      set({ 
        user: { 
          ...currentUser, 
          generationCount: newGenerationCount 
        } 
      });
      
      await updateUserProfile({ generationCount: newGenerationCount });
    } catch (error) {
      console.error('Error adding generation:', error);
    }
  },
  
  setUser: (userUpdate) => {
    const currentUser = get().user;
    const newUser = { ...currentUser, ...userUpdate };
    set({ user: newUser });
  },
  
  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },
  
  setSelectedPlatform: (platform) => {
    set({ selectedPlatform: platform });
  }
}));
