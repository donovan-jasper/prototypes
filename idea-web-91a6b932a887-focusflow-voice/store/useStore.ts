import { create } from 'zustand';
import { createSession, completeSession, getStreak, getLastSessionDate, resetStreak } from '../lib/database';
import { isSameDay, subDays } from 'date-fns';

interface Session {
  id: number;
  duration: number;
  startTime: Date;
  voicePack: string;
}

interface UserStats {
  totalSessions: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

interface StoreState {
  currentSession: Session | null;
  isPremium: boolean;
  selectedVoicePack: string;
  userStats: UserStats;
  startSession: (duration: number, voicePack: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => Promise<void>;
  updateStats: () => Promise<void>;
  setPremiumStatus: (isPremium: boolean) => void;
  setVoicePack: (voicePack: string) => void;
  resetStreakIfNeeded: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  currentSession: null,
  isPremium: false,
  selectedVoicePack: 'default',
  userStats: {
    totalSessions: 0,
    totalFocusTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
  },

  startSession: async (duration, voicePack) => {
    try {
      const sessionId = await createSession(duration, voicePack);
      set({
        currentSession: {
          id: sessionId,
          duration,
          startTime: new Date(),
          voicePack,
        },
      });
    } catch (error) {
      console.error('Failed to start session', error);
    }
  },

  pauseSession: () => {
    // Implementation would handle pausing the timer
    // This would be connected to the SessionTimer component
  },

  resumeSession: () => {
    // Implementation would handle resuming the timer
    // This would be connected to the SessionTimer component
  },

  completeSession: async () => {
    if (get().currentSession) {
      try {
        await completeSession(get().currentSession.id);
        await get().updateStats();
        set({ currentSession: null });
      } catch (error) {
        console.error('Failed to complete session', error);
      }
    }
  },

  updateStats: async () => {
    try {
      const [streak, lastSessionDate] = await Promise.all([
        getStreak(),
        getLastSessionDate()
      ]);

      set((state) => {
        const newStats = {
          ...state.userStats,
          currentStreak: streak,
          lastSessionDate: lastSessionDate,
          totalSessions: state.userStats.totalSessions + 1,
          totalFocusTime: state.userStats.totalFocusTime + (state.currentSession?.duration || 0),
        };

        // Update longest streak if needed
        if (streak > state.userStats.longestStreak) {
          newStats.longestStreak = streak;
        }

        return { userStats: newStats };
      });
    } catch (error) {
      console.error('Failed to update stats', error);
    }
  },

  resetStreakIfNeeded: async () => {
    try {
      const lastSessionDate = await getLastSessionDate();
      const today = new Date();

      if (lastSessionDate) {
        const lastDate = new Date(lastSessionDate);
        const yesterday = subDays(today, 1);

        // If last session was not yesterday or today, reset streak
        if (!isSameDay(lastDate, yesterday) && !isSameDay(lastDate, today)) {
          await resetStreak();
          set((state) => ({
            userStats: {
              ...state.userStats,
              currentStreak: 0,
            },
          }));
        }
      }
    } catch (error) {
      console.error('Failed to reset streak', error);
    }
  },

  setPremiumStatus: (isPremium) => set({ isPremium }),
  setVoicePack: (voicePack) => set({ selectedVoicePack: voicePack }),
}));
