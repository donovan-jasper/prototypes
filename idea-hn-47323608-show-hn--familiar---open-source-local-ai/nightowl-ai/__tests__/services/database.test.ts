import { Database } from '@/services/storage/database';

describe('Database', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database();
    await db.init();
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should create and retrieve tasks', async () => {
    const task = {
      type: 'organize_photos',
      status: 'pending',
      createdAt: Date.now(),
    };

    const id = await db.createTask(task);
    const retrieved = await db.getTask(id);

    expect(retrieved.type).toBe(task.type);
    expect(retrieved.status).toBe(task.status);
  });

  it('should update task status', async () => {
    const task = await db.createTask({ type: 'test', status: 'pending' });
    await db.updateTaskStatus(task.id, 'completed');

    const updated = await db.getTask(task.id);
    expect(updated.status).toBe('completed');
  });
});
