import create from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthStore {
  user: any;
  isPremium: boolean;
  isLoggedIn: boolean;
  login: (user: any) => void;
  logout: () => void;
  upgradeToPremium: () => void;
  checkPremiumStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isPremium: false,
  isLoggedIn: false,

  login: (user) => {
    set({ user, isLoggedIn: true });
    SecureStore.setItemAsync('user', JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, isLoggedIn: false, isPremium: false });
    SecureStore.deleteItemAsync('user');
  },

  upgradeToPremium: () => {
    set({ isPremium: true });
    if (set.user) {
      const updatedUser = { ...set.user, isPremium: true };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    }
  },

  checkPremiumStatus: async () => {
    try {
      const userString = await SecureStore.getItemAsync('user');
      if (userString) {
        const user = JSON.parse(userString);
        set({ user, isLoggedIn: true, isPremium: user.isPremium || false });
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  },
}));
