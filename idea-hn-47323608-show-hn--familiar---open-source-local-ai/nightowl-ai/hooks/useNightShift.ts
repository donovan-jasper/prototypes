import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface NightShiftSchedule {
  enabled: boolean;
  startHour: number;
  endHour: number;
  requiresCharging: boolean;
  minBatteryLevel: number;
}

const DEFAULT_SCHEDULE: NightShiftSchedule = {
  enabled: false,
  startHour: 2,
  endHour: 6,
  requiresCharging: true,
  minBatteryLevel: 20,
};

export function useNightShift() {
  const [schedule, setSchedule] = useState<NightShiftSchedule>(DEFAULT_SCHEDULE);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const savedSchedule = await SecureStore.getItemAsync('nightShiftSchedule');
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      }
    } catch (error) {
      console.error('Error loading night shift schedule:', error);
    }
  };

  const saveSchedule = async (newSchedule: NightShiftSchedule) => {
    try {
      await SecureStore.setItemAsync('nightShiftSchedule', JSON.stringify(newSchedule));
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error saving night shift schedule:', error);
    }
  };

  const toggleEnabled = async () => {
    const newSchedule = { ...schedule, enabled: !schedule.enabled };
    await saveSchedule(newSchedule);
  };

  const updateSchedule = async (updates: Partial<NightShiftSchedule>) => {
    const newSchedule = { ...schedule, ...updates };
    await saveSchedule(newSchedule);
  };

  const isInWindow = (date: Date, schedule: NightShiftSchedule): boolean => {
    const hours = date.getHours();
    return hours >= schedule.startHour && hours < schedule.endHour;
  };

  return {
    isEnabled: schedule.enabled,
    schedule,
    toggleEnabled,
    updateSchedule,
    isInWindow,
  };
}
