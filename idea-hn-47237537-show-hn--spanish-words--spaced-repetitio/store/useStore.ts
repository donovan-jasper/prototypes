import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDueWords, getSettings, updateSettings } from '../lib/database';

interface Word {
  id: number;
  word: string;
  translation: string;
  example: string;
  audioUrl: string;
  imageUrl?: string;
}

interface Settings {
  notificationsEnabled: boolean;
  notificationTime?: number;
  dailyGoal: number;
  currentLanguage: string;
}

interface StoreState {
  currentWord: Word | null;
  dailyQueue: Word[];
  reviewQueue: Word[];
  streak: number;
  lastPracticed: number | null;
  totalWordsLearned: number;
  settings: Settings;
  loadDailyQueue: () => Promise<void>;
  markWordReviewed: (wordId: number, direction: 'correct' | 'learning' | 'forgot') => void;
  incrementStreak: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentWord: null,
      dailyQueue: [],
      reviewQueue: [],
      streak: 0,
      lastPracticed: null,
      totalWordsLearned: 0,
      settings: {
        notificationsEnabled: true,
        dailyGoal: 10,
        currentLanguage: 'spanish',
      },

      loadDailyQueue: async () => {
        const { settings } = get();
        const newWords = await getDueWords(settings.dailyGoal);
        const reviewWords = await getDueWords(10);

        set({
          dailyQueue: [...newWords, ...reviewWords],
          currentWord: null,
        });
      },

      markWordReviewed: (wordId, direction) => {
        const { dailyQueue, totalWordsLearned } = get();
        const wordIndex = dailyQueue.findIndex(word => word.id === wordId);

        if (wordIndex !== -1) {
          const updatedQueue = [...dailyQueue];
          updatedQueue.splice(wordIndex, 1);

          set({
            dailyQueue: updatedQueue,
            totalWordsLearned: direction === 'correct' ? totalWordsLearned + 1 : totalWordsLearned,
          });
        }
      },

      incrementStreak: () => {
        const { streak, lastPracticed } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastPracticed) {
          const lastPracticedDate = new Date(lastPracticed);
          lastPracticedDate.setHours(0, 0, 0, 0);

          if (today.getTime() === lastPracticedDate.getTime()) {
            // Already practiced today
            return;
          }

          const diffTime = today.getTime() - lastPracticedDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day
            set({ streak: streak + 1, lastPracticed: today.getTime() });
          } else {
            // Broken streak
            set({ streak: 1, lastPracticed: today.getTime() });
          }
        } else {
          // First practice
          set({ streak: 1, lastPracticed: today.getTime() });
        }
      },

      updateSettings: async (newSettings) => {
        const { settings } = get();
        const updatedSettings = { ...settings, ...newSettings };
        set({ settings: updatedSettings });
        await updateSettings(updatedSettings);
      },
    }),
    {
      name: 'vocavault-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        streak: state.streak,
        lastPracticed: state.lastPracticed,
        totalWordsLearned: state.totalWordsLearned,
        settings: state.settings,
      }),
    }
  )
);

// Initialize settings from database
(async () => {
  const dbSettings = await getSettings();
  if (Object.keys(dbSettings).length > 0) {
    useStore.setState({ settings: dbSettings });
  }
})();
