import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const [tunerConfig, setTunerConfig] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await AsyncStorage.getItem('tunerConfig');
      setTunerConfig(config);
    };

    loadConfig();
  }, []);

  const handleRescan = () => {
    Alert.alert(
      'Rescan for Tuners',
      'This will search for OTA tuners on your network.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Scan', onPress: () => {
          // In a real implementation, we would trigger a rescan here
          Alert.alert('Scanning', 'Looking for tuners on your network...');
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tuner Configuration</Text>
        <Text style={styles.configText}>
          {tunerConfig ? `Connected to: ${tunerConfig}` : 'No tuner configured'}
        </Text>
        <Button title="Re-scan for Tuners" onPress={handleRescan} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.configText}>Free Tier - Limited to local WiFi</Text>
        <Button title="Upgrade to Premium" onPress={() => {
          Alert.alert('Premium Upgrade', 'Remote streaming requires a subscription.');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  configText: {
    fontSize: 16,
    marginBottom: 12,
  },
});
