import { create } from 'zustand';
import { sleepDetectionService } from '../services/sleepDetectionService';
import { databaseService } from '../services/databaseService';
import { audioService } from '../services/audioService';

interface SleepState {
  sleepStage: string;
  sleepTimer: number;
  sleepHistory: any[];
  startSleepSession: () => void;
  stopSleepSession: () => void;
  setSleepStage: (stage: string) => void;
  calculateSleepScore: () => number;
}

export const useSleepStore = create<SleepState>((set, get) => ({
  sleepStage: 'awake',
  sleepTimer: 0,
  sleepHistory: [],

  startSleepSession: () => {
    // Start motion detection
    sleepDetectionService.startDetection();

    // Start timer
    const timer = setInterval(() => {
      set({ sleepTimer: get().sleepTimer + 1 });
    }, 1000);

    // Load sleep history from database
    databaseService.getSleepHistory(7).then((history) => {
      set({ sleepHistory: history });
    });

    // Store timer reference for cleanup
    set({ sleepTimer: timer });
  },

  stopSleepSession: () => {
    // Stop motion detection
    sleepDetectionService.stopDetection();

    // Clear timer
    clearInterval(get().sleepTimer);

    // Save sleep session to database
    const session = {
      date: new Date().toISOString().split('T')[0],
      duration: get().sleepTimer,
      quality: get().calculateSleepScore(),
      sleepStages: {
        awake: 0, // In a real app, track actual time in each stage
        light: 0,
        deep: 0,
      },
    };

    databaseService.saveSleepSession(session);

    // Update sleep history
    databaseService.getSleepHistory(7).then((history) => {
      set({ sleepHistory: history });
    });

    // Reset state
    set({ sleepStage: 'awake', sleepTimer: 0 });
  },

  setSleepStage: (stage) => {
    set({ sleepStage: stage });

    // Adjust audio based on sleep stage
    audioService.adjustForSleepStage(stage);
  },

  calculateSleepScore: () => {
    // Simple sleep score calculation based on sleep duration and stages
    const duration = get().sleepTimer;
    const stage = get().sleepStage;

    let score = 0;

    // Base score on duration (4-8 hours ideal)
    if (duration >= 14400 && duration <= 28800) {
      score += 60;
    } else if (duration >= 10800 && duration < 14400 || duration > 28800 && duration <= 32400) {
      score += 40;
    } else {
      score += 20;
    }

    // Adjust for sleep stage
    if (stage === 'deep') {
      score += 20;
    } else if (stage === 'light') {
      score += 10;
    }

    return Math.min(score, 100);
  },
}));
