import create from 'zustand';

interface ChallengeState {
  availableChallenges: any[];
  activeChallenges: any[];
  completedChallenges: any[];
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  sendChallenge: (friendId: string, challengeId: string) => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  availableChallenges: [
    { id: '1', name: 'Hit 10 targets', description: 'Hit 10 targets in 60 seconds' },
    { id: '2', name: '5 bullseyes', description: 'Hit 5 bullseyes in a row' },
  ],
  activeChallenges: [],
  completedChallenges: [],
  startChallenge: (challengeId) => set((state) => ({
    activeChallenges: [...state.activeChallenges, state.availableChallenges.find(c => c.id === challengeId)],
  })),
  completeChallenge: (challengeId) => set((state) => ({
    activeChallenges: state.activeChallenges.filter(c => c.id !== challengeId),
    completedChallenges: [...state.completedChallenges, state.activeChallenges.find(c => c.id === challengeId)],
  })),
  sendChallenge: (friendId, challengeId) => {
    // Implementation for sending challenge to friend
  },
}));
