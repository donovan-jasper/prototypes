import { create } from 'zustand';
import {
  initializeDatabase,
  createSession,
  completeSession,
  getStreak,
  updateStreak,
  getTotalPoints,
  getCompletedDays,
  getFocusTimeStats,
  getCompletionRate,
  getProductiveHours,
  getUserPods,
  getRewards,
  initializeRewards,
} from '../lib/database';
import { setupBackgroundAudio, playBackgroundSound, stopBackgroundSound } from '../lib/audio';
import { setupNotifications, checkStreakReminder } from '../lib/notifications';
import * as SecureStore from 'expo-secure-store';

interface Session {
  id: number;
  duration: number;
  startTime: string;
  endTime?: string;
  completed: boolean;
  voicePack: string;
  points: number;
}

interface Pod {
  id: string;
  name: string;
  members: string[];
  activeMembers: string[];
}

interface Reward {
  id: number;
  name: string;
  pointsRequired: number;
  unlocked: boolean;
}

interface UserStats {
  currentStreak: number;
  totalPoints: number;
  level: number;
  completedDays: string[];
  todayFocusTime: number;
  weeklyFocusTime: number;
  monthlyFocusTime: number;
  completionRate: number[];
  productiveHours: number[];
}

interface StoreState {
  currentSession: Session | null;
  userStats: UserStats;
  userPods: Pod[];
  rewards: Reward[];
  isPremium: boolean;
  selectedVoicePack: string;
  initializeStore: () => Promise<void>;
  startSession: (duration: number, voicePack: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => Promise<void>;
  updateStats: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  currentSession: null,
  userStats: {
    currentStreak: 0,
    totalPoints: 0,
    level: 1,
    completedDays: [],
    todayFocusTime: 0,
    weeklyFocusTime: 0,
    monthlyFocusTime: 0,
    completionRate: [],
    productiveHours: [],
  },
  userPods: [],
  rewards: [],
  isPremium: false,
  selectedVoicePack: 'default',

  initializeStore: async () => {
    await initializeDatabase();
    await setupBackgroundAudio();
    await setupNotifications();

    // Check if rewards table is empty
    const rewards = await getRewards();
    if (rewards.length === 0) {
      await initializeRewards();
    }

    await get().updateStats();

    // Check for streak reminder
    await checkStreakReminder();
  },

  startSession: async (duration, voicePack) => {
    const sessionId = await createSession(duration, voicePack);
    const points = duration; // 1 point per minute

    set({
      currentSession: {
        id: sessionId,
        duration,
        startTime: new Date().toISOString(),
        completed: false,
        voicePack,
        points,
      },
    });

    await playBackgroundSound();
  },

  pauseSession: () => {
    // Logic to pause the session
  },

  resumeSession: () => {
    // Logic to resume the session
  },

  completeSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    await completeSession(currentSession.id);
    await updateStreak();
    await stopBackgroundSound();

    set({ currentSession: null });
    await get().updateStats();
  },

  updateStats: async () => {
    const streak = await getStreak();
    const totalPoints = await getTotalPoints();
    const completedDays = await getCompletedDays();
    const focusTimeStats = await getFocusTimeStats();
    const completionRate = await getCompletionRate();
    const productiveHours = await getProductiveHours();
    const pods = await getUserPods();
    const rewards = await getRewards();

    // Calculate level based on points
    let level = 1;
    if (totalPoints >= 2000) level = 4;
    else if (totalPoints >= 1000) level = 3;
    else if (totalPoints >= 500) level = 2;

    // Update unlocked rewards
    const updatedRewards = rewards.map((reward) => ({
      ...reward,
      unlocked: totalPoints >= reward.pointsRequired,
    }));

    set({
      userStats: {
        currentStreak: streak,
        totalPoints,
        level,
        completedDays,
        todayFocusTime: focusTimeStats.today || 0,
        weeklyFocusTime: focusTimeStats.weekly || 0,
        monthlyFocusTime: focusTimeStats.monthly || 0,
        completionRate: completionRate.map((item) => item.rate),
        productiveHours: productiveHours.map((item) => item.count),
      },
      userPods: pods,
      rewards: updatedRewards,
    });

    // Save streak to SecureStore for notifications
    await SecureStore.setItemAsync('currentStreak', streak.toString());
    await SecureStore.setItemAsync('lastSessionDate', new Date().toISOString().split('T')[0]);
  },
}));
