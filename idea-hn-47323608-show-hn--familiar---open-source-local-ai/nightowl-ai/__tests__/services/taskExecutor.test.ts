import { TaskExecutor } from '@/services/ai/taskExecutor';
import { TaskType } from '@/types';

describe('TaskExecutor', () => {
  it('should execute photo organization task', async () => {
    const executor = new TaskExecutor();
    const task = {
      id: '1',
      type: TaskType.ORGANIZE_PHOTOS,
      status: 'pending',
      createdAt: Date.now(),
    };

    const result = await executor.execute(task);
    expect(result.status).toBe('completed');
    expect(result.filesProcessed).toBeGreaterThan(0);
  });

  it('should handle task cancellation', async () => {
    const executor = new TaskExecutor();
    const task = {
      id: '2',
      type: TaskType.PROCESS_DOCUMENTS,
      status: 'pending',
      createdAt: Date.now(),
    };

    const promise = executor.execute(task);
    executor.cancel(task.id);

    await expect(promise).rejects.toThrow('Task cancelled');
  });
});
