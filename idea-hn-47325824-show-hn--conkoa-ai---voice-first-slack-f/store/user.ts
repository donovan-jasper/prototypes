import { create } from 'zustand';

interface UserStore {
  userId: string | null;
  setUserId: (id: string) => void;
  // Potentially add more user info like username, profile pic, etc.
}

export const useUserStore = create<UserStore>((set) => ({
  userId: 'mock-user-123', // Mock user ID for now
  setUserId: (id) => set({ userId: id }),
}));
