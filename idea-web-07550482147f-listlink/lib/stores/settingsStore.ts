import { create } from 'zustand';

interface SettingsState {
  isPremium: boolean;
  connectedPlatforms: string[];
  setPremiumStatus: (isPremium: boolean) => void;
  addConnectedPlatform: (platform: string) => void;
  removeConnectedPlatform: (platform: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isPremium: false,
  connectedPlatforms: ['ebay', 'poshmark'],

  setPremiumStatus: (isPremium) => set({ isPremium }),
  addConnectedPlatform: (platform) =>
    set((state) => ({
      connectedPlatforms: [...state.connectedPlatforms, platform]
    })),
  removeConnectedPlatform: (platform) =>
    set((state) => ({
      connectedPlatforms: state.connectedPlatforms.filter(p => p !== platform)
    })),
}));
