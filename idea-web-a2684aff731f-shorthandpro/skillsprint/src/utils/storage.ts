import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChallengeHistory {
  id: string;
  type: string;
  title: string;
  score: number;
  xp: number;
  timestamp: number;
}

export const getUserXP = async (): Promise<number> => {
  try {
    const xp = await AsyncStorage.getItem('userXP');
    return xp ? parseInt(xp, 10) : 0;
  } catch (error) {
    console.error('Error getting user XP:', error);
    return 0;
  }
};

export const setUserXP = async (xp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem('userXP', xp.toString());
  } catch (error) {
    console.error('Error setting user XP:', error);
  }
};

export const getChallengeHistory = async (): Promise<ChallengeHistory[]> => {
  try {
    const history = await AsyncStorage.getItem('challengeHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting challenge history:', error);
    return [];
  }
};

export const addChallengeToHistory = async (challenge: ChallengeHistory): Promise<void> => {
  try {
    const history = await getChallengeHistory();
    history.push(challenge);
    await AsyncStorage.setItem('challengeHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to challenge history:', error);
  }
};

export const updateStreak = async (): Promise<void> => {
  try {
    const lastLogin = await AsyncStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      const streak = await AsyncStorage.getItem('userStreak');
      const newStreak = streak ? parseInt(streak, 10) + 1 : 1;
      await AsyncStorage.setItem('userStreak', newStreak.toString());
      await AsyncStorage.setItem('lastLoginDate', today);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

export const getStreak = async (): Promise<number> => {
  try {
    const streak = await AsyncStorage.getItem('userStreak');
    return streak ? parseInt(streak, 10) : 0;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
};
