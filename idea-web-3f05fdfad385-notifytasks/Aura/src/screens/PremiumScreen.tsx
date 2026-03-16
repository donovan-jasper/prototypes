import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { AppConstants } from '../constants/AppConstants';
import * as InAppPurchases from 'expo-in-app-purchases';

const PremiumScreen: React.FC = () => {
  const handlePurchase = async () => {
    try {
      await InAppPurchases.connectAsync();
      const { responseCode, results } = await InAppPurchases.getProductsAsync([AppConstants.PREMIUM_PRODUCT_ID]);

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        const product = results[0];
        const purchase = await InAppPurchases.purchaseItemAsync(product.productId);
        if (purchase.results[0].responseCode === InAppPurchases.IAPResponseCode.OK) {
          // Handle successful purchase
        }
      }
    } catch (error) {
      console.error('Error during purchase:', error);
    } finally {
      await InAppPurchases.disconnectAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aura Premium</Text>
      <Text style={styles.description}>
        Unlock unlimited active items, advanced customization, location-based reminders, and more!
      </Text>
      <Button title="Subscribe for $2.99/month" onPress={handlePurchase} color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.primary,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.textSecondary,
  },
});

export default PremiumScreen;
