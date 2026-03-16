import { create } from 'zustand';

interface SettingsStore {
  isPro: boolean;
  encryptionEnabled: boolean;
  setIsPro: (isPro: boolean) => void;
  setEncryptionEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isPro: false,
  encryptionEnabled: false,
  setIsPro: (isPro) => set({ isPro }),
  setEncryptionEnabled: (enabled) => set({ encryptionEnabled: enabled })
}));
