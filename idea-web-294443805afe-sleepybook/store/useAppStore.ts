import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  emergencyContact: string | null;
  setEmergencyContact: (contact: string) => void;
  isPremium: boolean;
  setPremiumStatus: (isPremium: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      emergencyContact: null,
      setEmergencyContact: (contact) => set({ emergencyContact: contact }),
      isPremium: false,
      setPremiumStatus: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
