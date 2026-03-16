import { initDatabase, getReminders, addReminder, toggleReminder, getHabits, addHabit, toggleHabit } from '../lib/database';

describe('Database', () => {
  beforeAll(() => {
    initDatabase();
  });

  test('should add and retrieve reminders', () => {
    const reminder = { id: '1', title: 'Test Reminder', date: new Date().toISOString(), completed: false };
    addReminder(reminder);
    getReminders((reminders) => {
      expect(reminders).toContainEqual(reminder);
    });
  });

  test('should toggle reminder completion', () => {
    const reminder = { id: '2', title: 'Toggle Reminder', date: new Date().toISOString(), completed: false };
    addReminder(reminder);
    toggleReminder('2');
    getReminders((reminders) => {
      const updatedReminder = reminders.find(r => r.id === '2');
      expect(updatedReminder.completed).toBe(1);
    });
  });

  test('should add and retrieve habits', () => {
    const habit = { id: '1', title: 'Test Habit', streak: 0, completed: false };
    addHabit(habit);
    getHabits((habits) => {
      expect(habits).toContainEqual(habit);
    });
  });

  test('should toggle habit completion', () => {
    const habit = { id: '2', title: 'Toggle Habit', streak: 0, completed: false };
    addHabit(habit);
    toggleHabit('2');
    getHabits((habits) => {
      const updatedHabit = habits.find(h => h.id === '2');
      expect(updatedHabit.completed).toBe(1);
    });
  });
});
