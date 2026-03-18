import { create } from 'zustand';

interface UserState {
  isPremium: boolean;
  email: string | null;
  premiumExpiresAt: string | null;
  setPremium: (isPremium: boolean, expiresAt?: string) => void;
  setEmail: (email: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  email: null,
  premiumExpiresAt: null,
  
  setPremium: (isPremium, expiresAt) => set({
    isPremium,
    premiumExpiresAt: expiresAt || null,
  }),
  
  setEmail: (email) => set({ email }),
}));

export const FREE_TIER_LIMITS = {
  MAX_SHELVES: 3,
  MAX_ITEMS_PER_SHELF: 50,
};
