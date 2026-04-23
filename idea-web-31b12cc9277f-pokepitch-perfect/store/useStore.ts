import { create } from 'zustand';
import { Drill, DrillResult, UserStats } from '../lib/types';
import { saveDrillResult, getUserStats, getDrillResults } from '../lib/database';
import { adjustDifficulty } from '../lib/adaptive';

interface StoreState {
  drills: Drill[];
  currentDrill: Drill | null;
  currentSession: DrillResult | null;
  userStats: UserStats;
  isPremium: boolean;
  startDrill: (drillId: string) => void;
  submitResult: (result: DrillResult) => Promise<void>;
  updateStats: () => Promise<void>;
  togglePremium: () => void;
  setDrills: (drills: Drill[]) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  drills: [],
  currentDrill: null,
  currentSession: null,
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

  setDrills: (drills) => {
    set({ drills });
  },

  startDrill: (drillId) => {
    const drill = get().drills.find(d => d.id === drillId);
    if (drill) {
      set({ currentDrill: drill, currentSession: null });
    }
  },

  submitResult: async (result) => {
    // Save the result to database
    await saveDrillResult(result);

    // Get all results for this drill
    const allResults = await getDrillResults(result.drillId);

    // Adjust difficulty if needed
    const currentDrill = get().currentDrill;
    if (currentDrill) {
      const updatedDrill = adjustDifficulty(currentDrill, allResults);

      // Update the store
      set(state => ({
        currentSession: result,
        drills: state.drills.map(d =>
          d.id === updatedDrill.id ? updatedDrill : d
        ),
      }));
    }

    // Update user stats
    await get().updateStats();
  },

  updateStats: async () => {
    const stats = await getUserStats();
    set({ userStats: stats });
  },

  togglePremium: () => {
    set(state => ({ isPremium: !state.isPremium }));
  },
}));
