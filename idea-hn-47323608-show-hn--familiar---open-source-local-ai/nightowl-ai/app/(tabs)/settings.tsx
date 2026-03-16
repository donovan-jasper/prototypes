import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useNightShift } from '@/hooks/useNightShift';
import { NightShiftScheduler } from '@/components/NightShiftScheduler';
import { PrivacyDashboard } from '@/components/PrivacyDashboard';

export default function SettingsScreen() {
  const { isEnabled, toggleEnabled, schedule, updateSchedule } = useNightShift();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Night Shift</Text>
        <View style={styles.settingItem}>
          <Text>Enable Night Shift</Text>
          <Switch value={isEnabled} onValueChange={toggleEnabled} />
        </View>
        <NightShiftScheduler schedule={schedule} onUpdate={updateSchedule} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <PrivacyDashboard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
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
});
