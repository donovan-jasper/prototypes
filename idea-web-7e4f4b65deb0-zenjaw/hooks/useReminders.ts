import { useState, useEffect, useCallback } from 'react';
import { openDatabase, createTables, saveReminder, getReminders, updateReminderEnabled, deleteReminder } from '@/services/database';
import { scheduleReminder, cancelReminder } from '@/services/notifications';
import { Reminder, BodyZone } from '@/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const db = openDatabase();
      await createTables(db);
      await loadReminders();
    } catch (error) {
      console.error('Failed to initialize reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const db = openDatabase();
      const remindersList = await getReminders(db);
      setReminders(remindersList);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const addReminder = useCallback(async (time: string, bodyZone: BodyZone): Promise<Reminder> => {
    try {
      const db = openDatabase();
      const newReminder = await saveReminder(db, time, bodyZone, true);
      
      const notificationId = await scheduleReminder({
        title: 'Tension Check',
        body: `Time to check your ${bodyZone}`,
        time,
      });
      
      await loadReminders();
      return newReminder;
    } catch (error) {
      console.error('Failed to add reminder:', error);
      throw error;
    }
  }, []);

  const removeReminder = useCallback(async (id: number) => {
    try {
      const db = openDatabase();
      await cancelReminder(id.toString());
      await deleteReminder(db, id);
      await loadReminders();
    } catch (error) {
      console.error('Failed to remove reminder:', error);
      throw error;
    }
  }, []);

  const toggleReminder = useCallback(async (id: number, enabled: boolean) => {
    try {
      const db = openDatabase();
      await updateReminderEnabled(db, id, enabled);
      
      if (enabled) {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
          await scheduleReminder({
            title: 'Tension Check',
            body: `Time to check your ${reminder.bodyZone}`,
            time: reminder.time,
          });
        }
      } else {
        await cancelReminder(id.toString());
      }
      
      await loadReminders();
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      throw error;
    }
  }, [reminders]);

  const getActiveReminders = useCallback(() => {
    return reminders.filter(r => r.enabled);
  }, [reminders]);

  return {
    reminders,
    loading,
    addReminder,
    removeReminder,
    toggleReminder,
    getActiveReminders,
    refresh: loadReminders,
  };
}
