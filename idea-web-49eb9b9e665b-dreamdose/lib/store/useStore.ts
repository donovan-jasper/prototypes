import { create } from 'zustand';
import { Session } from '../session/sessionManager';
import { getUserPreferences, updatePreferences } from '../database/queries';

interface StoreState {
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  updateSessionEnergyRating: (sessionId: string, rating: number) => Promise<void>;
  preferences: {
    defaultDuration: number;
    defaultSoundscape: string;
    hapticEnabled: boolean;
    premiumStatus: boolean;
  };
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<StoreState['preferences']>) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  updateSessionEnergyRating: async (sessionId, rating) => {
    // Update in database
    await updateSessionEnergyRating(sessionId, rating);

    // Update in current session if it matches
    const currentSession = get().currentSession;
    if (currentSession && currentSession.id === sessionId) {
      set({
        currentSession: {
          ...currentSession,
          energyRating: rating
        }
      });
    }
  },

  preferences: {
    defaultDuration: 15,
    defaultSoundscape: 'rain',
    hapticEnabled: true,
    premiumStatus: false,
  },

  loadPreferences: async () => {
    const prefs = await getUserPreferences();
    if (prefs) {
      set({
        preferences: {
          defaultDuration: prefs.default_duration,
          defaultSoundscape: prefs.default_soundscape,
          hapticEnabled: prefs.haptic_enabled,
          premiumStatus: prefs.premium_status,
        }
      });
    }
  },

  updatePreferences: async (updates) => {
    const currentPrefs = get().preferences;
    const newPrefs = { ...currentPrefs, ...updates };

    // Update in database
    await updatePreferences(newPrefs);

    // Update in store
    set({ preferences: newPrefs });
  },
}));

// Initialize preferences on store creation
useStore.getState().loadPreferences();
