import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NightShiftSchedule } from '@/types';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { registerNightShiftTask } from '@/services/background/nightShiftTask';
import { useNightShift } from '@/hooks/useNightShift';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';

const NightShiftScheduler = () => {
  const { schedule, saveSchedule, isInWindow } = useNightShift();
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [nextRunTime, setNextRunTime] = useState<string | null>(null);

  useEffect(() => {
    calculateNextRunTime();
  }, [schedule]);

  const calculateNextRunTime = () => {
    if (!schedule.enabled) {
      setNextRunTime(null);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    if (schedule.startHour < schedule.endHour) {
      // Window doesn't cross midnight
      if (currentHour < schedule.startHour) {
        // Next run is today at start hour
        const nextRun = new Date(now);
        nextRun.setHours(schedule.startHour, 0, 0, 0);
        setNextRunTime(formatDateTime(nextRun));
      } else if (currentHour < schedule.endHour) {
        // Currently in window
        setNextRunTime('Now');
      } else {
        // Next run is tomorrow at start hour
        const nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(schedule.startHour, 0, 0, 0);
        setNextRunTime(formatDateTime(nextRun));
      }
    } else {
      // Window crosses midnight
      if (currentHour < schedule.endHour) {
        // Currently in window (before midnight)
        setNextRunTime('Now');
      } else if (currentHour >= schedule.startHour) {
        // Currently in window (after midnight)
        setNextRunTime('Now');
      } else {
        // Next run is today at start hour
        const nextRun = new Date(now);
        nextRun.setHours(schedule.startHour, 0, 0, 0);
        setNextRunTime(formatDateTime(nextRun));
      }
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleEnabled = () => {
    const newEnabled = !schedule.enabled;
    saveSchedule({ ...schedule, enabled: newEnabled });
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newStartHour = selectedTime.getHours();
      if (newStartHour >= schedule.endHour) {
        Alert.alert(
          'Invalid Time',
          'Start time must be before end time',
          [{ text: 'OK' }]
        );
        return;
      }
      saveSchedule({ ...schedule, startHour: newStartHour });
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newEndHour = selectedTime.getHours();
      if (newEndHour <= schedule.startHour) {
        Alert.alert(
          'Invalid Time',
          'End time must be after start time',
          [{ text: 'OK' }]
        );
        return;
      }
      saveSchedule({ ...schedule, endHour: newEndHour });
    }
  };

  const toggleRequiresCharging = () => {
    saveSchedule({ ...schedule, requiresCharging: !schedule.requiresCharging });
  };

  const updateMinBatteryLevel = (newMinBatteryLevel: number) => {
    saveSchedule({ ...schedule, minBatteryLevel: newMinBatteryLevel });
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Night Shift Scheduler</Text>
        <Switch
          value={schedule.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={schedule.enabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {schedule.enabled && nextRunTime && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: Active</Text>
          <Text style={styles.nextRunLabel}>Next Run: {nextRunTime}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Window</Text>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Start Time:</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(schedule.startHour)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.label}>End Time:</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(schedule.endHour)}</Text>
          </TouchableOpacity>
        </View>

        {showStartTimePicker && (
          <DateTimePicker
            value={new Date(0, 0, 0, schedule.startHour, 0)}
            mode="time"
            display="default"
            onChange={onStartTimeChange}
            is24Hour={false}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={new Date(0, 0, 0, schedule.endHour, 0)}
            mode="time"
            display="default"
            onChange={onEndTimeChange}
            is24Hour={false}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Power Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Requires Charging:</Text>
          <Switch
            value={schedule.requiresCharging}
            onValueChange={toggleRequiresCharging}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={schedule.requiresCharging ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Minimum Battery Level:</Text>
          <View style={styles.batteryLevelContainer}>
            <Text style={styles.batteryLevelText}>{schedule.minBatteryLevel}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#2e8b57',
    marginBottom: 4,
  },
  nextRunLabel: {
    fontSize: 14,
    color: '#555',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  timeButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  batteryLevelContainer: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  batteryLevelText: {
    fontSize: 14,
    color: '#333',
  },
});

export default NightShiftScheduler;
