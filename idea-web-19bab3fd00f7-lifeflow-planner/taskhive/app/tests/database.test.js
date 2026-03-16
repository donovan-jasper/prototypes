import { setupDatabase, getTasks, saveTasks } from '../utils/database';

describe('Database', () => {
  beforeAll(() => {
    setupDatabase();
  });

  it('saves and retrieves tasks', async () => {
    const tasks = [
      { title: "Buy milk", notes: "Grocery store", category: "Shopping" },
      { title: "Walk the dog", notes: "At the park", category: "General" },
    ];

    await saveTasks(tasks);
    const retrievedTasks = await getTasks();

    expect(retrievedTasks).toEqual(expect.arrayContaining(tasks));
  });
});
