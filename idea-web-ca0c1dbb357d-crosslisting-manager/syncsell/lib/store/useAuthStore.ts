import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isPremium: false,
  subscriptionStatus: 'free',
  login: (user) => set({ user }),
  logout: () => set({ user: null, isPremium: false, subscriptionStatus: 'free' }),
  upgradeToPremium: () => set({ isPremium: true, subscriptionStatus: 'premium' }),
}));

export default useAuthStore;
