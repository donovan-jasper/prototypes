import { initDatabase, addGoal, getGoals } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('addGoal creates a new goal', async () => {
    const goal = await addGoal('Test Goal');
    expect(goal).toHaveProperty('id');
    expect(goal.title).toBe('Test Goal');
  });

  test('getGoals returns array', async () => {
    const goals = await getGoals();
    expect(Array.isArray(goals)).toBe(true);
  });
});
