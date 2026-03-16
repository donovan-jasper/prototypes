import create from 'zustand';
import { Drill, DrillResult, UserStats } from '../lib/types';
import { saveDrillResult, getUserStats } from '../lib/database';
import { adjustDifficulty, shouldLevelUp } from '../lib/adaptive';

interface StoreState {
  drills: Drill[];
  currentDrill: Drill | null;
  userStats: UserStats;
  isPremium: boolean;
  startDrill: (drillId: string) => void;
  submitResult: (result: DrillResult) => void;
  updateStats: () => Promise<void>;
  togglePremium: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  drills: [],
  currentDrill: null,
  userStats: {
    streak: 0,
    totalDrills: 0,
    totalScore: 0,
    accuracyHistory: [],
    reactionTimeHistory: [],
    consistencyHistory: [],
    achievements: [],
  },
  isPremium: false,
  startDrill: (drillId) => {
    const { drills } = get();
    const drill = drills.find((d) => d.id === drillId);
    if (drill) {
      set({ currentDrill: drill });
    }
  },
  submitResult: async (result) => {
    await saveDrillResult(result);
    const { currentDrill, userStats } = get();
    if (currentDrill) {
      const levelUp = shouldLevelUp(userStats.drillResults.filter((r) => r.drillId === currentDrill.id));
      const newDifficulty = adjustDifficulty(currentDrill, levelUp);
      set({ currentDrill: newDifficulty });
    }
    await get().updateStats();
  },
  updateStats: async () => {
    const stats = await getUserStats();
    set({ userStats: stats });
  },
  togglePremium: () => {
    set((state) => ({ isPremium: !state.isPremium }));
  },
}));
