import { create } from 'zustand';
import { initializeDatabase } from '../lib/database';

interface ChallengeState {
  currentChallenge: string | null;
  isPremium: boolean;
  userStats: {
    streak: number;
    totalChallenges: number;
    bestScores: Record<string, number>;
  };
}

interface ChallengeActions {
  startChallenge: (challengeId: string) => void;
  endChallenge: () => void;
  updateStats: (stats: Partial<ChallengeState['userStats']>) => void;
  setPremium: (isPremium: boolean) => void;
}

export const useStore = create<ChallengeState & ChallengeActions>((set) => ({
  currentChallenge: null,
  isPremium: false,
  userStats: {
    streak: 0,
    totalChallenges: 0,
    bestScores: {},
  },

  startChallenge: (challengeId) => set({ currentChallenge: challengeId }),
  endChallenge: () => set({ currentChallenge: null }),
  updateStats: (stats) => set(state => ({
    userStats: {
      ...state.userStats,
      ...stats,
      bestScores: {
        ...state.userStats.bestScores,
        ...stats.bestScores
      }
    }
  })),
  setPremium: (isPremium) => set({ isPremium }),
}));

// Initialize database on app start
initializeDatabase().catch(console.error);
