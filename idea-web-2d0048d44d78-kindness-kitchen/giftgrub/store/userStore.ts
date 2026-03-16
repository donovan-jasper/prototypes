import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  subscriptionStatus: 'free',
  updateSubscription: (status) => set({ subscriptionStatus: status }),
}));

export default useUserStore;
