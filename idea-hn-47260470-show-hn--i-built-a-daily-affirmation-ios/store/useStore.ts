import { create } from 'zustand';
import { getCurrentStreak, calculateStreakWithGraceDays, updateStreak } from '../lib/database';
import { format } from 'date-fns';

interface StoreState {
  currentAffirmation: any;
  streakCount: number;
  goals: any[];
  isPremium: boolean;
  lastMoodRating: number;
  graceDaysUsedThisWeek: number;
  setAffirmation: (affirmation: any) => void;
  updateStreak: (date: Date) => Promise<void>;
  addGoal: (goal: any) => void;
  setMoodRating: (rating: number) => void;
  setStreakCount: (count: number) => void;
  setGraceDaysUsed: (count: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentAffirmation: null,
  streakCount: 0,
  goals: [],
  isPremium: false,
  lastMoodRating: 2,
  graceDaysUsedThisWeek: 0,
  setAffirmation: (affirmation) => set({ currentAffirmation: affirmation }),
  updateStreak: async (date: Date) => {
    const { streakCount, isGraceDay } = await calculateStreakWithGraceDays(date);
    const today = format(date, 'yyyy-MM-dd');
    await updateStreak(today, isGraceDay, streakCount);
    set({ streakCount });

    // Update grace days used if this was a grace day
    if (isGraceDay) {
      const graceDaysUsed = await getGraceDaysUsedThisWeek(date);
      set({ graceDaysUsedThisWeek: graceDaysUsed });
    }
  },
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  setMoodRating: (rating) => set({ lastMoodRating: rating }),
  setStreakCount: (count) => set({ streakCount: count }),
  setGraceDaysUsed: (count) => set({ graceDaysUsedThisWeek: count }),
}));

export const getGraceDaysUsedThisWeek = async (date: Date) => {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  const streaks = await getStreakData();
  const graceDays = streaks.filter(streak => {
    const streakDate = parseISO(streak.date);
    return streak.is_grace_day === 1 &&
           streakDate >= weekStart &&
           streakDate <= weekEnd;
  });

  return graceDays.length;
};
