import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Text, Alert } from 'react-native';
import { useDatabaseStore } from '../../store/database-store';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from 'expo-router';

export default function SettingsScreen() {
  const [offlineMode, setOfflineMode] = useState(false);
  const { isConnected } = useNetInfo();
  const navigation = useNavigation();

  useEffect(() => {
    // Load offline mode setting from store
    const loadSettings = async () => {
      const storedOfflineMode = await AsyncStorage.getItem('offlineMode');
      if (storedOfflineMode !== null) {
        setOfflineMode(JSON.parse(storedOfflineMode));
      }
    };
    loadSettings();
  }, []);

  const toggleOfflineMode = async () => {
    if (!isConnected && !offlineMode) {
      Alert.alert(
        'No Internet Connection',
        'You must be connected to the internet to enable offline mode for the first time.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newOfflineMode = !offlineMode;
    setOfflineMode(newOfflineMode);
    await AsyncStorage.setItem('offlineMode', JSON.stringify(newOfflineMode));

    if (newOfflineMode) {
      // When enabling offline mode, sync all databases
      const databases = useDatabaseStore.getState().databases;
      databases.forEach(db => {
        useDatabaseStore.getState().loadSchema(db.id);
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Offline Mode</Text>
          <Switch
            value={offlineMode}
            onValueChange={toggleOfflineMode}
            disabled={!isConnected && !offlineMode}
          />
        </View>
        <Text style={styles.statusText}>
          {isConnected ? 'Connected to internet' : 'No internet connection'}
        </Text>
        {offlineMode && (
          <Text style={styles.offlineWarning}>
            Offline mode enabled. Some features may be limited.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  statusText: {
    marginTop: 8,
    color: '#666',
  },
  offlineWarning: {
    marginTop: 12,
    color: '#d32f2f',
    fontWeight: '500',
  },
});
