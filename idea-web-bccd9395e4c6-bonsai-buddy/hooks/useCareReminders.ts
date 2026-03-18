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
      await loadReminders();
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
      await loadReminders();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { reminders, loading, error, loadReminders, completeReminder, snoozeReminder };
};
