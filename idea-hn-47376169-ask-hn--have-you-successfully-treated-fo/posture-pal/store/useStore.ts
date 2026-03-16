import create from 'zustand';
import { persist } from 'zustand/middleware';
import { exercises } from '@/lib/exercises';
import { logPainEntry, getPainHistory, addPosturePhoto, getPosturePhotos, getStreakCount, incrementStreak, resetStreak, togglePremium, toggleNotifications } from '@/lib/database';

interface StoreState {
  exercises: typeof exercises;
  painHistory: { level: number; timestamp: string }[];
  posturePhotos: string[];
  streak: number;
  isPremium: boolean;
  notificationsEnabled: boolean;
  logPain: (level: number) => Promise<void>;
  addPosturePhoto: (uri: string) => Promise<void>;
  completeExercise: (id: string) => void;
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  togglePremium: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      exercises,
      painHistory: [],
      posturePhotos: [],
      streak: 0,
      isPremium: false,
      notificationsEnabled: true,

      logPain: async (level) => {
        await logPainEntry(level);
        const painHistory = await getPainHistory();
        set({ painHistory });
      },

      addPosturePhoto: async (uri) => {
        await addPosturePhoto(uri);
        const posturePhotos = await getPosturePhotos();
        set({ posturePhotos });
      },

      completeExercise: (id) => {
        // Exercise completion logic
      },

      incrementStreak: async () => {
        await incrementStreak();
        const streak = await getStreakCount();
        set({ streak });
      },

      resetStreak: async () => {
        await resetStreak();
        set({ streak: 0 });
      },

      togglePremium: async () => {
        const newPremiumStatus = !get().isPremium;
        await togglePremium(newPremiumStatus);
        set({ isPremium: newPremiumStatus });
      },

      toggleNotifications: async () => {
        const newNotificationsStatus = !get().notificationsEnabled;
        await toggleNotifications(newNotificationsStatus);
        set({ notificationsEnabled: newNotificationsStatus });
      },
    }),
    {
      name: 'posture-pal-storage',
      getStorage: () => require('expo-file-system').Storage,
    }
  )
);
