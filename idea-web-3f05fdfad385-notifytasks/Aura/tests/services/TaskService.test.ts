import { TaskService } from '../../src/services/TaskService';
import db from '../../src/services/DatabaseService';

jest.mock('../../src/services/DatabaseService');

describe('TaskService', () => {
  beforeEach(() => {
    (db.transaction as jest.Mock).mockImplementation((callback, errorCallback) => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success, error) => {
          if (sql.includes('INSERT')) {
            success({}, { insertId: 1 });
          } else if (sql.includes('SELECT')) {
            const rows = {
              length: 1,
              item: (index: number) => ({
                id: 1,
                content: 'Test Task',
                type: 'task',
                isCompleted: 0,
                dueDate: null,
                isPinned: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                locationData: null,
                isPremium: 0,
              }),
            };
            success({}, { rows });
          } else if (sql.includes('UPDATE')) {
            success({}, { rowsAffected: 1 });
          } else if (sql.includes('DELETE')) {
            success({}, { rowsAffected: 1 });
          }
        }),
      };
      callback(mockTx);
    });
  });

  it('adds a new task successfully', async () => {
    await TaskService.addTask('Test Task', 'task');

    expect(db.transaction).toHaveBeenCalled();
  });

  it('retrieves all tasks', async () => {
    const tasks = await TaskService.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].content).toBe('Test Task');
  });

  it('retrieves a specific task by ID', async () => {
    const task = await TaskService.getTaskById(1);

    expect(task).not.toBeNull();
    expect(task?.content).toBe('Test Task');
  });

  it('updates an existing task', async () => {
    await TaskService.updateTask(1, 'Updated Task', 'task');

    expect(db.transaction).toHaveBeenCalled();
  });

  it('marks a task as complete/incomplete', async () => {
    await TaskService.updateTaskStatus(1, true);

    expect(db.transaction).toHaveBeenCalled();
  });

  it('removes a task from the database', async () => {
    await TaskService.deleteTask(1);

    expect(db.transaction).toHaveBeenCalled();
  });

  it('retrieves tasks suitable for widgets/notifications', async () => {
    const tasks = await TaskService.getActiveGlanceableTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].content).toBe('Test Task');
  });
});
