import { useState } from 'react';
import { getCareReminders, completeReminder as completeReminderDb, snoozeReminder as snoozeReminderDb } from '../lib/database';

export const useCareReminders = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const remindersData = await getCareReminders();
      setReminders(remindersData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const completeReminder = async (id: string) => {
    setLoading(true);
    try {
      await completeReminderDb(id);
      const updatedReminders = reminders.filter(reminder => reminder.id !== id);
      setReminders(updatedReminders);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const snoozeReminder = async (id: string, hours: number) => {
    setLoading(true);
    try {
      await snoozeReminderDb(id, hours);
      const updatedReminders = reminders.map(reminder => {
        if (reminder.id === id) {
          const newDate = new Date();
          newDate.setHours(newDate.getHours() + hours);
          return { ...reminder, scheduledFor: newDate.toISOString() };
        }
        return reminder;
      });
      setReminders(updatedReminders);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { reminders, loading, error, loadReminders, completeReminder, snoozeReminder };
};
