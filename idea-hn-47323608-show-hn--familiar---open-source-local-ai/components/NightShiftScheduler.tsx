import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NightShiftSchedule } from '@/types';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { registerNightShiftTask } from '@/services/background/nightShiftTask';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';

const NightShiftScheduler = () => {
  const [schedule, setSchedule] = useState<NightShiftSchedule>({
    enabled: false,
    startHour: 2,
    endHour: 6,
    requiresCharging: true,
    minBatteryLevel: 20,
  });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const storedSchedule = await SecureStore.getItemAsync('nightShiftSchedule');
      if (storedSchedule) {
        const parsedSchedule = JSON.parse(storedSchedule);
        setSchedule(parsedSchedule);
        if (parsedSchedule.enabled) {
          await registerNightShiftTask();
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const saveSchedule = async (newSchedule: NightShiftSchedule) => {
    try {
      await SecureStore.setItemAsync('nightShiftSchedule', JSON.stringify(newSchedule));
      setSchedule(newSchedule);

      if (newSchedule.enabled) {
        await registerNightShiftTask();
      } else {
        await TaskManager.unregisterTaskAsync(NIGHT_SHIFT_TASK_NAME);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const toggleEnabled = () => {
    const newEnabled = !schedule.enabled;
    saveSchedule({ ...schedule, enabled: newEnabled });
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newStartHour = selectedTime.getHours();
      saveSchedule({ ...schedule, startHour: newStartHour });
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newEndHour = selectedTime.getHours();
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
            {[20, 30, 40, 50].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.batteryLevelButton,
                  schedule.minBatteryLevel === level && styles.selectedBatteryLevel
                ]}
                onPress={() => updateMinBatteryLevel(level)}
              >
                <Text style={styles.batteryLevelText}>{level}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {schedule.enabled
            ? `Night Shift is active from ${formatTime(schedule.startHour)} to ${formatTime(schedule.endHour)}`
            : 'Night Shift is currently disabled'}
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
    flex: 1,
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  batteryLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  batteryLevelButton: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedBatteryLevel: {
    backgroundColor: '#81b0ff',
  },
  batteryLevelText: {
    fontSize: 14,
    color: '#333',
  },
  statusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
  },
});

export default NightShiftScheduler;
