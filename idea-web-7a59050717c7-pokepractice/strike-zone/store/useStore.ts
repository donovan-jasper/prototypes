import create from 'zustand';

const useStore = create((set) => ({
  currentChallenge: null,
  userStats: {
    streak: 0,
    totalChallenges: 0,
    bestScores: {},
  },
  isPremium: false,
  startChallenge: (challenge) => set({ currentChallenge: challenge }),
  endChallenge: () => set({ currentChallenge: null }),
  updateStats: (stats) => set((state) => ({
    userStats: {
      ...state.userStats,
      ...stats,
    },
  })),
  setPremium: (isPremium) => set({ isPremium }),
}));

export default useStore;
