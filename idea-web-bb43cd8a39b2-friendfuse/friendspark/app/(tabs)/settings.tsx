import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSettings } from '../../hooks/useSettings';

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Nudges</Text>
          <Switch
            value={settings.dailyNudges}
            onValueChange={(value) => updateSetting('dailyNudges', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity style={styles.subscriptionButton}>
          <Text style={styles.subscriptionText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>FriendSpark v1.0.0</Text>
        <Text style={styles.aboutText}>Privacy Policy</Text>
        <Text style={styles.aboutText}>Terms of Service</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  subscriptionButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  subscriptionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
});
