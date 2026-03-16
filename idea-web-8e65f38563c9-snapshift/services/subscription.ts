import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_ID = 'com.yourcompany.voicevault.premium';

export const checkSubscriptionStatus = async () => {
  try {
    await InAppPurchases.connectAsync();

    const history = await InAppPurchases.getPurchaseHistoryAsync();
    const activeSubscriptions = history.filter(
      (purchase) => purchase.productId === PRODUCT_ID && purchase.isCancelled === false
    );

    return activeSubscriptions.length > 0;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
};

export const purchaseSubscription = async () => {
  try {
    await InAppPurchases.connectAsync();

    const { responseCode, results } = await InAppPurchases.getProductsAsync([PRODUCT_ID]);

    if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
      const product = results[0];

      const purchase = await InAppPurchases.purchaseItemAsync(product.productId);

      if (purchase.results.length > 0) {
        const purchaseDetails = purchase.results[0];
        if (purchaseDetails.productId === PRODUCT_ID) {
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
        (purchase) => purchase.productId === PRODUCT_ID && purchase.isCancelled === false
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
