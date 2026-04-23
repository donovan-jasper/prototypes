import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { NightShiftSchedule } from '@/types';
import { registerNightShiftTask, unregisterNightShiftTask } from '@/services/background/nightShiftTask';

const NIGHT_SHIFT_SCHEDULE_KEY = 'nightShiftSchedule';

export const useNightShift = () => {
  const [schedule, setSchedule] = useState<NightShiftSchedule>({
    enabled: false,
    startHour: 2,
    endHour: 6,
    requiresCharging: true,
    minBatteryLevel: 20,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const storedSchedule = await SecureStore.getItemAsync(NIGHT_SHIFT_SCHEDULE_KEY);
      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchedule = async (newSchedule: NightShiftSchedule) => {
    try {
      await SecureStore.setItemAsync(NIGHT_SHIFT_SCHEDULE_KEY, JSON.stringify(newSchedule));
      setSchedule(newSchedule);

      if (newSchedule.enabled) {
        await registerNightShiftTask();
      } else {
        await unregisterNightShiftTask();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const isInWindow = (date: Date, schedule: NightShiftSchedule): boolean => {
    const currentHour = date.getHours();

    if (schedule.startHour < schedule.endHour) {
      // Window doesn't cross midnight
      return currentHour >= schedule.startHour && currentHour < schedule.endHour;
    } else {
      // Window crosses midnight
      return currentHour >= schedule.startHour || currentHour < schedule.endHour;
    }
  };

  return {
    schedule,
    isLoading,
    saveSchedule,
    isInWindow,
  };
};
