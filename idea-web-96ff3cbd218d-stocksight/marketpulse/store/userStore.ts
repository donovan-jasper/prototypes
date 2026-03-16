import create from 'zustand';

interface UserStore {
  isPremium: boolean;
  preferences: {
    riskTolerance: string;
    interests: string[];
  };
  setPreferences: (preferences: { riskTolerance: string; interests: string[] }) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isPremium: false,
  preferences: {
    riskTolerance: '',
    interests: [],
  },
  setPreferences: (preferences) => set({ preferences }),
}));
