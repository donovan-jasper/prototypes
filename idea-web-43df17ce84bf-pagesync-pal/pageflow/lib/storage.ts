import AsyncStorage from '@react-native-async-storage/async-storage';

export const getPremiumStatus = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('premiumStatus');
    return value === 'true';
  } catch (error) {
    console.error('Error getting premium status:', error);
    return false;
  }
};

export const setPremiumStatus = async (isPremium: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('premiumStatus', isPremium.toString());
  } catch (error) {
    console.error('Error setting premium status:', error);
  }
};

export const getSyncEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('syncEnabled');
    return value === 'true';
  } catch (error) {
    console.error('Error getting sync status:', error);
    return false;
  }
};

export const setSyncEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('syncEnabled', enabled.toString());
  } catch (error) {
    console.error('Error setting sync status:', error);
  }
};
