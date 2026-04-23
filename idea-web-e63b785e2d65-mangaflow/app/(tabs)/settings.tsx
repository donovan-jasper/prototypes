import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useUserStore } from '../../store/user';
import { clearPremiumStatus } from '../../lib/premium';

const SettingsScreen = () => {
  const { isPremium, expirationDate, isLoading, initializePremiumStatus } = useUserStore();

  useEffect(() => {
    initializePremiumStatus();
  }, []);

  const formatExpirationDate = () => {
    if (!expirationDate) return 'No expiration date';

    const date = new Date(expirationDate);
    return date.toLocaleDateString();
  };

  const handleResetPremium = async () => {
    try {
      await clearPremiumStatus();
      await initializePremiumStatus();
      Alert.alert('Success', 'Premium status reset');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset premium status');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Premium Status</Text>
          <Text style={[styles.settingValue, isPremium ? styles.premiumActive : styles.premiumInactive]}>
            {isPremium ? 'Active' : 'Inactive'}
          </Text>
        </View>

        {isPremium && (
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Expires</Text>
            <Text style={styles.settingValue}>{formatExpirationDate()}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPremium}
        >
          <Text style={styles.buttonText}>Reset Premium Status (Debug)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Preferences</Text>
        {/* Add reading preference settings here */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Library Management</Text>
        {/* Add library management options here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#444',
  },
  settingValue: {
    fontSize: 16,
  },
  premiumActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  premiumInactive: {
    color: '#9E9E9E',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
