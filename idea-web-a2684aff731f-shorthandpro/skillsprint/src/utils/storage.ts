import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChallengeHistory {
  id: string;
  type: string;
  title: string;
  score: number;
  xp: number;
  timestamp: number;
}

export interface UserProgress {
  totalXP: number;
  currentStreak: number;
  lastLoginDate: string;
  challengeHistory: ChallengeHistory[];
}

const STORAGE_KEYS = {
  USER_XP: 'userXP',
  CURRENT_STREAK: 'currentStreak',
  LAST_LOGIN_DATE: 'lastLoginDate',
  CHALLENGE_HISTORY: 'challengeHistory',
};

export const getUserXP = async (): Promise<number> => {
  try {
    const xp = await AsyncStorage.getItem(STORAGE_KEYS.USER_XP);
    return xp ? parseInt(xp, 10) : 0;
  } catch (error) {
    console.error('Error getting user XP:', error);
    return 0;
  }
};

export const setUserXP = async (xp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_XP, xp.toString());
  } catch (error) {
    console.error('Error setting user XP:', error);
  }
};

export const getCurrentStreak = async (): Promise<number> => {
  try {
    const streak = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STREAK);
    return streak ? parseInt(streak, 10) : 0;
  } catch (error) {
    console.error('Error getting current streak:', error);
    return 0;
  }
};

export const updateStreak = async (): Promise<number> => {
  try {
    const lastLoginDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE);
    const today = new Date().toDateString();
    
    if (!lastLoginDate) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, '1');
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DATE, today);
      return 1;
    }

    const lastLogin = new Date(lastLoginDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = 1;
    if (diffDays === 0) {
      const currentStreak = await getCurrentStreak();
      newStreak = currentStreak;
    } else if (diffDays === 1) {
      const currentStreak = await getCurrentStreak();
      newStreak = currentStreak + 1;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, newStreak.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DATE, today);
    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

export const getChallengeHistory = async (): Promise<ChallengeHistory[]> => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting challenge history:', error);
    return [];
  }
};

export const addChallengeToHistory = async (challenge: ChallengeHistory): Promise<void> => {
  try {
    const history = await getChallengeHistory();
    history.unshift(challenge);
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding challenge to history:', error);
  }
};

export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const [totalXP, currentStreak, lastLoginDate, challengeHistory] = await Promise.all([
      getUserXP(),
      getCurrentStreak(),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE),
      getChallengeHistory(),
    ]);

    return {
      totalXP,
      currentStreak,
      lastLoginDate: lastLoginDate || '',
      challengeHistory,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {
      totalXP: 0,
      currentStreak: 0,
      lastLoginDate: '',
      challengeHistory: [],
    };
  }
};
