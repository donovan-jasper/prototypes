import { queueChange, processSyncQueue } from '../lib/sync';

describe('Sync queue', () => {
  test('queues changes when offline', () => {
    queueChange({ type: 'INSERT', table: 'rows', data: { name: 'Test' } });
    const queue = getSyncQueue();
    expect(queue.length).toBe(1);
  });

  test('processes queue when online', async () => {
    queueChange({ type: 'INSERT', table: 'rows', data: { name: 'Test' } });
    await processSyncQueue();
    const queue = getSyncQueue();
    expect(queue.length).toBe(0);
  });
});
