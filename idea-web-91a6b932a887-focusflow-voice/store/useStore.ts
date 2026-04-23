import { create } from 'zustand';
import { createSession } from '../lib/database';

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
  completeSession: () => void;
  updateStats: (duration: number) => void;
  setPremiumStatus: (isPremium: boolean) => void;
  setVoicePack: (voicePack: string) => void;
  resetStreakIfNeeded: () => void;
}

export const useStore = create<StoreState>((set) => ({
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

  completeSession: () => {
    set({ currentSession: null });
  },

  updateStats: (duration) => {
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      let newStreak = state.userStats.currentStreak + 1;
      let newLongestStreak = state.userStats.longestStreak;

      // Check if this is a new day
      if (state.userStats.lastSessionDate !== today) {
        // If it's the next day after a break, reset streak
        if (state.userStats.lastSessionDate) {
          const lastDate = new Date(state.userStats.lastSessionDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      // Update longest streak if needed
      if (newStreak > state.userStats.longestStreak) {
        newLongestStreak = newStreak;
      }

      return {
        userStats: {
          totalSessions: state.userStats.totalSessions + 1,
          totalFocusTime: state.userStats.totalFocusTime + duration,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastSessionDate: today,
        },
      };
    });
  },

  resetStreakIfNeeded: () => {
    set((state) => {
      const today = new Date().toISOString().split('T')[0];

      if (state.userStats.lastSessionDate !== today) {
        const lastDate = state.userStats.lastSessionDate ? new Date(state.userStats.lastSessionDate) : null;
        const currentDate = new Date(today);

        if (lastDate) {
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            return {
              userStats: {
                ...state.userStats,
                currentStreak: 0,
              },
            };
          }
        }
      }

      return state;
    });
  },

  setPremiumStatus: (isPremium) => set({ isPremium }),
  setVoicePack: (voicePack) => set({ selectedVoicePack: voicePack }),
}));
