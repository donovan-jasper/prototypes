import { addHabit, getHabits, logHabitCompletion } from '../lib/habits';
import { initDatabase, resetDatabase } from '../lib/database';

describe('Habit Management', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
  });

  test('should create and retrieve habits', async () => {
    const habit = await addHabit('Drink 8 glasses of water', 'water', 'daily');
    expect(habit.name).toBe('Drink 8 glasses of water');

    const habits = await getHabits();
    expect(habits.length).toBeGreaterThan(0);
  });

  test('should log habit completion', async () => {
    const habit = await addHabit('Exercise 30 min', 'fitness', 'daily');
    const log = await logHabitCompletion(habit.id, new Date());
    expect(log.completed).toBe(true);
  });
});
