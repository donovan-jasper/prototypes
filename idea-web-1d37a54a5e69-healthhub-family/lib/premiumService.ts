import * as SecureStore from 'expo-secure-store';

const PREMIUM_KEY = 'carecircle_premium';

export const isPremium = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(PREMIUM_KEY);
  return value === 'true';
};

export const setPremium = async (premium: boolean): Promise<void> => {
  await SecureStore.setItemAsync(PREMIUM_KEY, premium.toString());
};

export const checkFamilyLimit = async (currentCount: number): Promise<boolean> => {
  const premium = await isPremium();
  return premium || currentCount < 3;
};

export const checkDocumentLimit = async (currentCount: number): Promise<boolean> => {
  const premium = await isPremium();
  return premium || currentCount < 50;
};
