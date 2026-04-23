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
    set((state) => ({
      userStats: {
        totalSessions: state.userStats.totalSessions + 1,
        totalFocusTime: state.userStats.totalFocusTime + duration,
        currentStreak: state.userStats.currentStreak + 1,
        longestStreak: Math.max(
          state.userStats.currentStreak + 1,
          state.userStats.longestStreak
        ),
      },
    }));
  },

  setPremiumStatus: (isPremium) => set({ isPremium }),
  setVoicePack: (voicePack) => set({ selectedVoicePack: voicePack }),
}));
