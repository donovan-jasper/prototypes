import { create } from 'zustand';
import { getCurrentStreak } from '../lib/database';

interface StoreState {
  currentAffirmation: any;
  streakCount: number;
  goals: any[];
  isPremium: boolean;
  lastMoodRating: number;
  setAffirmation: (affirmation: any) => void;
  updateStreak: () => Promise<void>;
  addGoal: (goal: any) => void;
  setMoodRating: (rating: number) => void;
  setStreakCount: (count: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentAffirmation: null,
  streakCount: 0,
  goals: [],
  isPremium: false,
  lastMoodRating: 2,
  setAffirmation: (affirmation) => set({ currentAffirmation: affirmation }),
  updateStreak: async () => {
    const streak = await getCurrentStreak();
    set({ streakCount: streak });
  },
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  setMoodRating: (rating) => set({ lastMoodRating: rating }),
  setStreakCount: (count) => set({ streakCount: count }),
}));
