import { create } from 'zustand';
import { Drill, DrillResult, UserStats } from '../lib/types';
import { saveDrillResult, getUserStats } from '../lib/database';
import { adjustDifficulty } from '../lib/adaptive';

interface StoreState {
  drills: Drill[];
  currentDrill: Drill | null;
  currentSession: DrillResult | null;
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
  currentSession: null,
  userStats: {
    totalDrillsCompleted: 0,
    averageScore: 0,
    bestDrill: '',
    streak: 0,
    lastDrillDate: 0,
  },
  isPremium: false,

  startDrill: (drillId) => {
    const drill = get().drills.find(d => d.id === drillId);
    if (drill) {
      set({ currentDrill: drill });
    }
  },

  submitResult: async (result) => {
    // Save the result to database
    await saveDrillResult(result);

    // Get all results for this drill
    const allResults = await getDrillResults(result.drillId);

    // Adjust difficulty if needed
    const updatedDrill = adjustDifficulty(get().currentDrill!, allResults);

    // Update the store
    set(state => ({
      currentSession: result,
      drills: state.drills.map(d =>
        d.id === updatedDrill.id ? updatedDrill : d
      ),
    }));

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

// Helper function to get drill results (would be implemented in database.ts)
async function getDrillResults(drillId: string): Promise<DrillResult[]> {
  // Implementation would query the database
  return [];
}
