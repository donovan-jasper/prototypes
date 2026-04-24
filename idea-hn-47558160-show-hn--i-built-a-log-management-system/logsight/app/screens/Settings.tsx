import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAlerts from '../hooks/useAlerts';

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState(false);
  const { setNotificationSettings } = useAlerts();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
        const storedCriticalAlerts = await AsyncStorage.getItem('criticalAlertsEnabled');

        if (storedNotifications !== null) {
          setNotificationsEnabled(JSON.parse(storedNotifications));
        }

        if (storedCriticalAlerts !== null) {
          setCriticalAlertsEnabled(JSON.parse(storedCriticalAlerts));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
    setNotificationSettings({ notificationsEnabled: newValue, criticalAlertsEnabled });
  };

  const toggleCriticalAlerts = async () => {
    const newValue = !criticalAlertsEnabled;
    setCriticalAlertsEnabled(newValue);
    await AsyncStorage.setItem('criticalAlertsEnabled', JSON.stringify(newValue));
    setNotificationSettings({ notificationsEnabled, criticalAlertsEnabled: newValue });
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Critical Alerts</Text>
        <Switch
          value={criticalAlertsEnabled}
          onValueChange={toggleCriticalAlerts}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Settings;
