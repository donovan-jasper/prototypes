import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '@/store';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const { user, subscriptionStatus, upgradeToPremium } = useStore();
  const navigation = useNavigation();

  const handleUpgrade = () => {
    upgradeToPremium();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.text}>Email: {user?.email}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Sharing</Text>
        {subscriptionStatus === 'premium' ? (
          <>
            <Text style={styles.text}>Share your sensor data with up to 5 family members</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('FamilySharing')}
            >
              <Text style={styles.buttonText}>Manage Family Members</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.premiumFeature}>
            <Text style={styles.premiumText}>This feature requires a premium subscription</Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Export All Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Clear Local Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>Version 1.0.0</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <Text style={styles.text}>Unlock advanced analytics with machine learning insights</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  premiumFeature: {
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 16,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
