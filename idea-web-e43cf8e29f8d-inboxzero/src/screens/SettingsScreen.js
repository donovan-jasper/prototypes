import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { getSetting, setSetting } from '../services/SubscriptionService';
import { requestPermissions, registerBackgroundTask, unregisterBackgroundTask } from '../services/NotificationService';

const SettingsScreen = () => {
  const [renewalReminders, setRenewalReminders] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const reminders = await getSetting('renewal_reminders');
    setRenewalReminders(reminders === 'true');
  };

  const handleToggleReminders = async (value) => {
    if (value) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive renewal reminders.'
        );
        return;
      }
      await registerBackgroundTask();
    } else {
      await unregisterBackgroundTask();
    }

    setRenewalReminders(value);
    await setSetting('renewal_reminders', value ? 'true' : 'false');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Renewal Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified 3 days before subscription renewals
            </Text>
          </View>
          <Switch
            value={renewalReminders}
            onValueChange={handleToggleReminders}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          When enabled, you'll receive local notifications 3 days before any paid subscription renews.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    padding: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});

export default SettingsScreen;
