import { create } from 'zustand';
import { getReminders, addReminder as dbAddReminder, toggleReminder as dbToggleReminder } from '../lib/database';
import { Reminder } from '../types';

interface RemindersState {
  reminders: Reminder[];
  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Reminder) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
}

export const useReminders = create<RemindersState>((set) => ({
  reminders: [],
  fetchReminders: async () => {
    await getReminders((reminders) => {
      set({ reminders });
    });
  },
  addReminder: async (reminder) => {
    await dbAddReminder(reminder);
    set((state) => ({ reminders: [reminder, ...state.reminders] }));
  },
  toggleReminder: async (id) => {
    await dbToggleReminder(id);
    set((state) => ({
      reminders: state.reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      ),
    }));
  },
}));
