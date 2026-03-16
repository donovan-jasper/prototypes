import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../../store/useStore';
import { scheduleNotification, cancelNotification } from '../../lib/notifications';

export default function SettingsScreen() {
  const { settings, updateSettings } = useStore();
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (settings.notificationTime) {
      setNotificationTime(new Date(settings.notificationTime));
    }
  }, [settings.notificationTime]);

  const toggleNotifications = (value: boolean) => {
    updateSettings({ notificationsEnabled: value });
    if (value) {
      scheduleNotification(notificationTime);
    } else {
      cancelNotification();
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || notificationTime;
    setShowTimePicker(Platform.OS === 'ios');
    setNotificationTime(currentTime);
    updateSettings({ notificationTime: currentTime.getTime() });
    scheduleNotification(currentTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Daily Reminders</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={settings.notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.settingLabel}>Notification Time</Text>
          <Text style={styles.timeText}>
            {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={notificationTime}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Practice</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Goal</Text>
          <View style={styles.goalOptions}>
            {[5, 10, 15].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  settings.dailyGoal === goal && styles.selectedGoal,
                ]}
                onPress={() => updateSettings({ dailyGoal: goal })}
              >
                <Text style={[
                  styles.goalText,
                  settings.dailyGoal === goal && styles.selectedGoalText,
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Current Language</Text>
          <Text style={styles.languageText}>Spanish</Text>
        </View>
        <Text style={styles.lockedText}>More languages available in premium version</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          VocaVault - Master the 1,000 most useful words in any language
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E40AF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  timeText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  goalOptions: {
    flexDirection: 'row',
  },
  goalOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: '#E5E7EB',
  },
  selectedGoal: {
    backgroundColor: '#3B82F6',
  },
  goalText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedGoalText: {
    color: 'white',
  },
  languageText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  lockedText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },
  aboutText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
