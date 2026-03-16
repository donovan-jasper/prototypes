import { create } from 'zustand';

interface StoreState {
  currentAffirmation: any;
  streakCount: number;
  goals: any[];
  isPremium: boolean;
  lastMoodRating: number;
  setAffirmation: (affirmation: any) => void;
  updateStreak: (count: number) => void;
  addGoal: (goal: any) => void;
  setMoodRating: (rating: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentAffirmation: null,
  streakCount: 0,
  goals: [],
  isPremium: false,
  lastMoodRating: 2,
  setAffirmation: (affirmation) => set({ currentAffirmation: affirmation }),
  updateStreak: (count) => set({ streakCount: count }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  setMoodRating: (rating) => set({ lastMoodRating: rating }),
}));
