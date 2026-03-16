import create from 'zustand';

interface UserState {
  isPremium: boolean;
  activityType: string;
  sessionCount: number;
  upgradeToPremium: () => void;
  setActivityType: (type: string) => void;
  incrementSessionCount: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  activityType: 'basketball',
  sessionCount: 0,
  upgradeToPremium: () => set({ isPremium: true }),
  setActivityType: (type) => set({ activityType: type }),
  incrementSessionCount: () => set((state) => ({ sessionCount: state.sessionCount + 1 })),
}));
