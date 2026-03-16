import { Platform } from 'react-native';
import * as Purchases from 'react-native-purchases';

const API_KEYS = {
  ios: 'your_ios_api_key',
  android: 'your_android_api_key',
};

export const initPurchases = async () => {
  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: API_KEYS.ios });
  } else if (Platform.OS === 'android') {
    await Purchases.configure({ apiKey: API_KEYS.android });
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current.availablePackages;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const purchasePackage = async (package) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(package);
    return customerInfo;
  } catch (e) {
    console.error(e);
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (e) {
    console.error(e);
  }
};
