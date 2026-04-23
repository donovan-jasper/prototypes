import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import PromptScheduler from '../../components/PromptScheduler';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isPremium, isLoading, error, purchaseSubscription, restorePurchases } = useContext(SubscriptionContext);
  const [showAnnualOption, setShowAnnualOption] = useState(false);

  const handleUpgradePress = () => {
    setShowAnnualOption(true);
  };

  const handlePurchase = async (isAnnual: boolean) => {
    const success = await purchaseSubscription(isAnnual);
    if (success) {
      Alert.alert('Success', 'Your subscription is active!');
    } else {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('Success', 'Your purchases have been restored!');
    } else {
      Alert.alert('Error', 'No purchases found to restore.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#673ab7" />
        ) : isPremium ? (
          <View style={styles.premiumContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.premiumText}>Premium Member</Text>
          </View>
        ) : showAnnualOption ? (
          <View style={styles.planOptions}>
            <TouchableOpacity
              style={[styles.planButton, styles.monthlyButton]}
              onPress={() => handlePurchase(false)}
            >
              <Text style={styles.planButtonText}>$7.99/month</Text>
              <Text style={styles.planSubtext}>Billed monthly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planButton, styles.annualButton]}
              onPress={() => handlePurchase(true)}
            >
              <Text style={styles.planButtonText}>$59.99/year</Text>
              <Text style={styles.planSubtext}>7-day free trial</Text>
              <Text style={styles.annualDiscount}>Save 37%</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prompt Schedule</Text>
        <PromptScheduler />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  premiumText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#673ab7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#673ab7',
    fontSize: 14,
  },
  errorText: {
    color: '#e53935',
    marginVertical: 8,
    textAlign: 'center',
  },
  planOptions: {
    marginVertical: 12,
  },
  planButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  monthlyButton: {
    backgroundColor: '#e8eaf6',
  },
  annualButton: {
    backgroundColor: '#f3e5f5',
    position: 'relative',
  },
  planButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  annualDiscount: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
