import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDueWords, getSettings, updateSettings, getTotalWordsLearned } from '../lib/database';
import { calculateNextReview, updateCardState } from '../lib/fsrs';

interface Word {
  id: number;
  word: string;
  translation: string;
  example: string;
  audioUrl: string;
  imageUrl?: string;
  difficulty?: number;
  stability?: number;
  retrievability?: number;
  correctCount?: number;
  incorrectCount?: number;
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
  markWordReviewed: (wordId: number, direction: 'correct' | 'learning' | 'forgot') => Promise<void>;
  incrementStreak: () => void;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  loadTotalWordsLearned: () => Promise<void>;
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
        try {
          const newWords = await getDueWords(settings.dailyGoal);
          const reviewWords = await getDueWords(10);

          // Combine and shuffle the queue
          const combinedQueue = [...newWords, ...reviewWords];
          const shuffledQueue = combinedQueue.sort(() => Math.random() - 0.5);

          set({
            dailyQueue: shuffledQueue,
            currentWord: shuffledQueue.length > 0 ? shuffledQueue[0] : null,
          });
        } catch (error) {
          console.error('Error loading daily queue:', error);
        }
      },

      markWordReviewed: async (wordId, direction) => {
        const { dailyQueue, totalWordsLearned } = get();
        const wordIndex = dailyQueue.findIndex(word => word.id === wordId);

        if (wordIndex !== -1) {
          const currentWord = dailyQueue[wordIndex];
          const rating = direction === 'correct' ? 'easy' :
                       direction === 'learning' ? 'good' : 'forgot';

          const cardState = {
            difficulty: currentWord.difficulty || 2.5,
            stability: currentWord.stability || 1,
            retrievability: currentWord.retrievability || 0,
          };

          const updatedCard = updateCardState(cardState, rating);
          const nextReview = calculateNextReview(updatedCard, rating);

          try {
            await updateProgress(currentWord.id, {
              wordId: currentWord.id,
              lastReviewed: Date.now(),
              nextReview: nextReview.date.getTime(),
              difficulty: updatedCard.difficulty,
              stability: updatedCard.stability,
              retrievability: updatedCard.retrievability,
              correctCount: direction === 'correct' ? (currentWord.correctCount || 0) + 1 : (currentWord.correctCount || 0),
              incorrectCount: direction === 'forgot' ? (currentWord.incorrectCount || 0) + 1 : (currentWord.incorrectCount || 0),
            });

            const updatedQueue = [...dailyQueue];
            updatedQueue.splice(wordIndex, 1);

            set({
              dailyQueue: updatedQueue,
              currentWord: updatedQueue.length > 0 ? updatedQueue[0] : null,
              totalWordsLearned: direction === 'correct' ? totalWordsLearned + 1 : totalWordsLearned,
            });
          } catch (error) {
            console.error('Error updating word progress:', error);
          }
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
        try {
          await updateSettings(updatedSettings);
        } catch (error) {
          console.error('Error updating settings:', error);
        }
      },

      loadTotalWordsLearned: async () => {
        try {
          const count = await getTotalWordsLearned();
          set({ totalWordsLearned: count });
        } catch (error) {
          console.error('Error loading total words learned:', error);
        }
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
  try {
    const dbSettings = await getSettings();
    if (Object.keys(dbSettings).length > 0) {
      useStore.setState({ settings: dbSettings });
    }

    // Load initial data
    await useStore.getState().loadDailyQueue();
    await useStore.getState().loadTotalWordsLearned();
  } catch (error) {
    console.error('Error initializing store:', error);
  }
})();
