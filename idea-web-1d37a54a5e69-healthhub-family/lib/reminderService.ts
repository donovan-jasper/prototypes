import db from './database';
import { Reminder } from '../types';
import * as Notifications from 'expo-notifications';
import { addMonths, addWeeks, addDays, addYears } from 'date-fns';

export const addReminder = async (data: Omit<Reminder, 'id' | 'createdAt' | 'active' | 'notificationId'>): Promise<Reminder> => {
  const result = await db.runAsync(
    'INSERT INTO reminders (family_member_id, title, frequency, next_date) VALUES (?, ?, ?, ?)',
    [data.familyMemberId, data.title, data.frequency, data.nextDate]
  );
  
  const reminder = (await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [result.lastInsertRowId]))!;
  
  // Schedule notification
  const notificationId = await scheduleReminderNotification(reminder);
  await db.runAsync('UPDATE reminders SET notification_id = ? WHERE id = ?', [notificationId, reminder.id]);
  
  return { ...reminder, notificationId };
};

export const getActiveReminders = async (): Promise<Reminder[]> => {
  return await db.getAllAsync<Reminder>('SELECT * FROM reminders WHERE active = 1 ORDER BY next_date ASC');
};

export const getRemindersByMember = async (familyMemberId: number): Promise<Reminder[]> => {
  return await db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE family_member_id = ? AND active = 1 ORDER BY next_date ASC',
    [familyMemberId]
  );
};

export const updateReminder = async (id: number, data: Partial<Reminder>): Promise<Reminder> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE reminders SET ${fields} WHERE id = ?`, values);
  
  return (await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]))!;
};

export const completeReminder = async (id: number): Promise<void> => {
  const reminder = await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
  if (!reminder) return;
  
  // Calculate next date based on frequency
  let nextDate = new Date(reminder.nextDate);
  switch (reminder.frequency) {
    case 'daily':
      nextDate = addDays(nextDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(nextDate, 1);
      break;
    case 'monthly':
      nextDate = addMonths(nextDate, 1);
      break;
    case 'yearly':
      nextDate = addYears(nextDate, 1);
      break;
    case 'once':
      await db.runAsync('UPDATE reminders SET active = 0 WHERE id = ?', [id]);
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }
      return;
  }
  
  // Cancel old notification and schedule new one
  if (reminder.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
  }
  
  const notificationId = await scheduleReminderNotification({ ...reminder, nextDate: nextDate.toISOString() });
  await db.runAsync('UPDATE reminders SET next_date = ?, notification_id = ? WHERE id = ?', [nextDate.toISOString(), notificationId, id]);
};

export const deleteReminder = async (id: number): Promise<void> => {
  const reminder = await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
  if (reminder?.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
  }
  await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
};

const scheduleReminderNotification = async (reminder: Reminder): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Health Reminder',
      body: reminder.title,
      data: { reminderId: reminder.id },
    },
    trigger: {
      date: new Date(reminder.nextDate),
    },
  });
};
