import { TaskQueue } from '../lib/taskQueue';
import { Task, TaskStatus } from '../types';

describe('TaskQueue', () => {
  let queue: TaskQueue;

  beforeEach(() => {
    queue = new TaskQueue(4);
  });

  test('adds task to queue', () => {
    const task: Task = {
      id: '1',
      prompt: 'Test prompt',
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
    };
    queue.addTask(task);
    expect(queue.getTasks()).toHaveLength(1);
  });

  test('respects max parallel limit', () => {
    for (let i = 0; i < 6; i++) {
      queue.addTask({
        id: `${i}`,
        prompt: `Task ${i}`,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
      });
    }
    const running = queue.getTasks().filter(t => t.status === TaskStatus.RUNNING);
    expect(running.length).toBeLessThanOrEqual(4);
  });

  test('completes task and starts next in queue', async () => {
    for (let i = 0; i < 5; i++) {
      queue.addTask({
        id: `${i}`,
        prompt: `Task ${i}`,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
      });
    }
    
    await queue.completeTask('0');
    const running = queue.getTasks().filter(t => t.status === TaskStatus.RUNNING);
    expect(running.length).toBe(4);
  });

  test('cancels task', () => {
    const task: Task = {
      id: '1',
      prompt: 'Test',
      status: TaskStatus.RUNNING,
      createdAt: Date.now(),
    };
    queue.addTask(task);
    queue.cancelTask('1');
    expect(queue.getTask('1')?.status).toBe(TaskStatus.CANCELLED);
  });

  test('runs 4 tasks in parallel completing in ~5 seconds', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 4; i++) {
      queue.addTask({
        id: `${i}`,
        prompt: `Task ${i}`,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
      });
    }

    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const completed = queue.getTasks().filter(t => t.status === TaskStatus.COMPLETED);
        if (completed.length === 4) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });

    const duration = Date.now() - startTime;
    
    expect(duration).toBeGreaterThan(4500);
    expect(duration).toBeLessThan(7000);
    
    const allCompleted = queue.getTasks().every(t => t.status === TaskStatus.COMPLETED);
    expect(allCompleted).toBe(true);
  }, 10000);
});
