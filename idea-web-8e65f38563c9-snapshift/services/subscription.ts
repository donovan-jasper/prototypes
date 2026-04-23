import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_ID_MONTHLY = 'com.yourcompany.voicevault.premium.monthly';
const PRODUCT_ID_ANNUAL = 'com.yourcompany.voicevault.premium.annual';

export const checkSubscriptionStatus = async () => {
  try {
    await InAppPurchases.connectAsync();

    const history = await InAppPurchases.getPurchaseHistoryAsync();
    const activeSubscriptions = history.filter(
      (purchase) =>
        (purchase.productId === PRODUCT_ID_MONTHLY || purchase.productId === PRODUCT_ID_ANNUAL) &&
        purchase.isCancelled === false &&
        (!purchase.expirationDate || new Date(purchase.expirationDate) > new Date())
    );

    return activeSubscriptions.length > 0;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
};

export const purchaseSubscription = async (isAnnual: boolean = false) => {
  try {
    await InAppPurchases.connectAsync();

    const productId = isAnnual ? PRODUCT_ID_ANNUAL : PRODUCT_ID_MONTHLY;
    const { responseCode, results } = await InAppPurchases.getProductsAsync([productId]);

    if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
      const product = results[0];

      const purchase = await InAppPurchases.purchaseItemAsync(product.productId, {
        offerId: isAnnual ? 'annual_trial_7days' : undefined
      });

      if (purchase.results.length > 0) {
        const purchaseDetails = purchase.results[0];
        if (purchaseDetails.productId === productId) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
};

export const restorePurchases = async () => {
  try {
    await InAppPurchases.connectAsync();

    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      const activeSubscriptions = results.filter(
        (purchase) =>
          (purchase.productId === PRODUCT_ID_MONTHLY || purchase.productId === PRODUCT_ID_ANNUAL) &&
          purchase.isCancelled === false &&
          (!purchase.expirationDate || new Date(purchase.expirationDate) > new Date())
      );

      return activeSubscriptions.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
};

export const isFeatureUnlocked = async (feature: 'unlimitedPrompts' | 'fullLibrary' | 'multipleGoals') => {
  const isPremium = await checkSubscriptionStatus();

  switch (feature) {
    case 'unlimitedPrompts':
      return isPremium;
    case 'fullLibrary':
      return isPremium;
    case 'multipleGoals':
      return isPremium;
    default:
      return false;
  }
};
