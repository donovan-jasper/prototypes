import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { isRemoteStreamingEnabled } from '../../lib/streaming';

export default function SettingsScreen() {
  const [tunerConfig, setTunerConfig] = useState<any>(null);
  const [remoteStreamingEnabled, setRemoteStreamingEnabled] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const navigation = useNavigation();

  useEffect(() => {
    const loadSettings = async () => {
      const config = await AsyncStorage.getItem('tunerConfig');
      if (config) {
        setTunerConfig(JSON.parse(config));
      }

      const status = await AsyncStorage.getItem('subscriptionStatus');
      if (status) {
        setSubscriptionStatus(status);
      }

      const isEnabled = await isRemoteStreamingEnabled();
      setRemoteStreamingEnabled(isEnabled);
    };

    loadSettings();
  }, []);

  const handleRemoteStreamingToggle = async (value: boolean) => {
    if (value && subscriptionStatus !== 'premium') {
      // Show paywall
      Alert.alert(
        'Premium Feature',
        'Remote streaming requires a premium subscription. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('subscription') }
        ]
      );
      return;
    }

    setRemoteStreamingEnabled(value);
    await AsyncStorage.setItem('remoteStreamingEnabled', value ? 'true' : 'false');
  };

  const handleRescanTuners = () => {
    // In a real app, this would trigger tuner discovery
    Alert.alert('Rescanning', 'Looking for tuners on your network...');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tuner Configuration</Text>
        {tunerConfig ? (
          <>
            <Text style={styles.label}>Connected Tuner:</Text>
            <Text style={styles.value}>{tunerConfig.model || 'HDHomeRun'}</Text>
            <Text style={styles.label}>IP Address:</Text>
            <Text style={styles.value}>{tunerConfig.ip}</Text>
          </>
        ) : (
          <Text style={styles.value}>No tuner configured</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRescanTuners}
        >
          <Text style={styles.buttonText}>Rescan for Tuners</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remote Streaming</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Remote Access</Text>
          <Switch
            value={remoteStreamingEnabled}
            onValueChange={handleRemoteStreamingToggle}
            disabled={subscriptionStatus !== 'premium'}
          />
        </View>

        {subscriptionStatus !== 'premium' && (
          <View style={styles.paywall}>
            <Text style={styles.paywallText}>Premium feature</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('subscription')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.label}>Subscription:</Text>
        <Text style={styles.value}>{subscriptionStatus === 'premium' ? 'Premium' : 'Free'}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('subscription')}
        >
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paywall: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paywallText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
