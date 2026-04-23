import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PREMIUM_KEY = 'premium_status';
const EXPIRATION_KEY = 'premium_expiration';

interface PremiumStatus {
  isPremium: boolean;
  expirationDate?: number;
}

export async function checkPremiumStatus(): Promise<PremiumStatus> {
  try {
    const status = await SecureStore.getItemAsync(PREMIUM_KEY);
    const expiration = await SecureStore.getItemAsync(EXPIRATION_KEY);

    if (status === 'true') {
      const expirationDate = expiration ? parseInt(expiration, 10) : undefined;

      // Check if subscription is still valid
      if (!expirationDate || expirationDate > Date.now()) {
        return {
          isPremium: true,
          expirationDate
        };
      }
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
  }

  return { isPremium: false };
}

export async function validateSubscription(receipt: string): Promise<boolean> {
  // Mock validation for development
  // In production, this would call RevenueCat or your backend
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock validation logic
    if (receipt.includes('valid')) {
      // Set expiration to 30 days from now
      const expirationDate = Date.now() + (30 * 24 * 60 * 60 * 1000);

      await SecureStore.setItemAsync(PREMIUM_KEY, 'true');
      await SecureStore.setItemAsync(EXPIRATION_KEY, expirationDate.toString());

      return true;
    }
  } catch (error) {
    console.error('Subscription validation failed:', error);
  }

  return false;
}

export async function canAddManga(currentCount: number, isPremium: boolean): Promise<boolean> {
  if (isPremium) {
    return true;
  }

  // Free tier limit
  const FREE_TIER_LIMIT = 10;
  return currentCount < FREE_TIER_LIMIT;
}

export async function clearPremiumStatus(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PREMIUM_KEY);
    await SecureStore.deleteItemAsync(EXPIRATION_KEY);
  } catch (error) {
    console.error('Error clearing premium status:', error);
  }
}
