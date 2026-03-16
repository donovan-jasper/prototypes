import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, useTheme } from 'react-native-paper';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Settings
      </Text>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notifications
        </Text>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Quiet Hours</Text>
          <Switch
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Defaults
        </Text>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Default Check-in Frequency</Text>
          <Text variant="bodyMedium">Weekly</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Premium Subscription</Text>
          <Text variant="bodyMedium">Not subscribed</Text>
        </View>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Export Data</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          About
        </Text>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Privacy Policy</Text>
        </View>
        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Terms of Service</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
