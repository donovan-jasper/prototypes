import { create } from 'zustand';
import { Drill, DrillResult, UserStats } from '../lib/types';
import { saveDrillResult, getUserStats, getDrillResults, updateDrillDifficulty, getAllDrills, unlockAchievement } from '../lib/database';
import { adjustDifficulty, shouldLevelUp } from '../lib/adaptive';

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
  loadDrills: () => Promise<void>;
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

  loadDrills: async () => {
    const drills = await getAllDrills();
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

    // Check for achievements
    await get().checkAchievements(result);

    // Get all results for this drill
    const allResults = await getDrillResults(result.drillId);

    // Adjust difficulty if needed
    const currentDrill = get().currentDrill;
    if (currentDrill) {
      const { newDifficulty, shouldAdjust } = adjustDifficulty(currentDrill, allResults);

      if (shouldAdjust) {
        // Update the drill's difficulty in the database
        await updateDrillDifficulty(currentDrill.id, newDifficulty);

        // Calculate difficulty change for display
        const difficultyChange = newDifficulty - currentDrill.difficulty;

        // Update the store
        set(state => ({
          currentSession: result,
          drills: state.drills.map(d =>
            d.id === currentDrill.id
              ? { ...d, difficulty: newDifficulty, difficultyChange }
              : d
          ),
        }));
      } else {
        set({ currentSession: result });
      }
    }

    // Update user stats
    await get().updateStats();
  },

  checkAchievements: async (result: DrillResult) => {
    const { userStats } = get();

    // Check for first drill achievement
    if (userStats.totalDrills === 0) {
      await unlockAchievement('first-drill');
    }

    // Check for accuracy achievement
    if (result.accuracy >= 90) {
      await unlockAchievement('accuracy-90');
    }

    // Check for perfect score
    if (result.score === 100) {
      await unlockAchievement('perfect-score');
    }

    // Check for streak achievement
    const updatedStats = await getUserStats();
    if (updatedStats.streak >= 3) {
      await unlockAchievement('streak-3');
    }

    // Update stats after checking achievements
    set({ userStats: updatedStats });
  },

  updateStats: async () => {
    const stats = await getUserStats();
    set({ userStats: stats });
  },

  togglePremium: () => {
    set(state => ({ isPremium: !state.isPremium }));
  },
}));
