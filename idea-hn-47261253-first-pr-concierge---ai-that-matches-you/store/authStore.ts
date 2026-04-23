import { create } from 'zustand';
import { authenticateUser, fetchUserProfile } from '../lib/github';
import { GitHubUser } from '../types';

interface AuthState {
  user: GitHubUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  checkSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isSubscribed: false,
  loading: false,
  error: null,

  login: async () => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authenticateUser();
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
      // Check subscription status after login
      await useAuthStore.getState().checkSubscription();
    } catch (err) {
      set({
        error: 'Failed to authenticate',
        loading: false
      });
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isSubscribed: false
    });
  },

  checkSubscription: async () => {
    // In a real app, this would call your subscription service
    // For now, we'll simulate it based on user's GitHub profile
    const { user } = useAuthStore.getState();

    if (user) {
      // Simulate: users with more than 10 repos are considered subscribed
      const isSubscribed = user.publicRepos > 10;
      set({ isSubscribed });
    }
  },
}));
