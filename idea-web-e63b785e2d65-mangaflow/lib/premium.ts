import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const PREMIUM_KEY = 'premium_status';
const EXPIRATION_KEY = 'premium_expiration';

interface PremiumStatus {
  isPremium: boolean;
  expirationDate?: number;
}

export async function initializeRevenueCat(apiKey: string) {
  try {
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey });
    }
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

export async function checkPremiumStatus(): Promise<PremiumStatus> {
  try {
    // First check local storage
    const status = await SecureStore.getItemAsync(PREMIUM_KEY);
    const expiration = await SecureStore.getItemAsync(EXPIRATION_KEY);

    if (status === 'true') {
      const expirationDate = expiration ? parseInt(expiration, 10) : undefined;

      // Verify with RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active['premium']) {
        const newExpiration = customerInfo.entitlements.active['premium'].expirationDate;
        if (newExpiration) {
          const newExpirationDate = new Date(newExpiration).getTime();
          if (newExpirationDate !== expirationDate) {
            await SecureStore.setItemAsync(EXPIRATION_KEY, newExpirationDate.toString());
            return { isPremium: true, expirationDate: newExpirationDate };
          }
        }
        return { isPremium: true, expirationDate };
      }
    }

    // If not premium locally, check with RevenueCat
    const customerInfo = await Purchases.getCustomerInfo();
    if (customerInfo.entitlements.active['premium']) {
      const expirationDate = customerInfo.entitlements.active['premium'].expirationDate
        ? new Date(customerInfo.entitlements.active['premium'].expirationDate).getTime()
        : undefined;

      await SecureStore.setItemAsync(PREMIUM_KEY, 'true');
      if (expirationDate) {
        await SecureStore.setItemAsync(EXPIRATION_KEY, expirationDate.toString());
      }

      return { isPremium: true, expirationDate };
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
  }

  return { isPremium: false };
}

export async function validateSubscription(): Promise<boolean> {
  try {
    const { isPremium, expirationDate } = await checkPremiumStatus();
    return isPremium;
  } catch (error) {
    console.error('Subscription validation failed:', error);
    return false;
  }
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
    await Purchases.logOut();
  } catch (error) {
    console.error('Error clearing premium status:', error);
  }
}

export async function purchasePremium(): Promise<boolean> {
  try {
    // Replace with your actual product identifiers
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      const packageToPurchase = offerings.current.monthly;

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      if (customerInfo.entitlements.active['premium']) {
        const expirationDate = customerInfo.entitlements.active['premium'].expirationDate
          ? new Date(customerInfo.entitlements.active['premium'].expirationDate).getTime()
          : undefined;

        await SecureStore.setItemAsync(PREMIUM_KEY, 'true');
        if (expirationDate) {
          await SecureStore.setItemAsync(EXPIRATION_KEY, expirationDate.toString());
        }

        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  }
}
