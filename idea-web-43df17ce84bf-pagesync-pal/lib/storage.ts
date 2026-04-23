import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STATUS_KEY = 'premium_status';

export const getPremiumStatus = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting premium status:', error);
    return false;
  }
};

export const setPremiumStatus = async (isPremium: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREMIUM_STATUS_KEY, isPremium.toString());
  } catch (error) {
    console.error('Error setting premium status:', error);
  }
};
