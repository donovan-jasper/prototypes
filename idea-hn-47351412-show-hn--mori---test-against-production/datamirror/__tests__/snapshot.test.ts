import { createSnapshot, loadSnapshot } from '../lib/database/snapshot';
import { sanitizeData } from '../lib/database/sanitizer';

describe('Snapshot creation', () => {
  test('creates snapshot from PostgreSQL connection', async () => {
    const connection = { type: 'postgres', host: 'localhost', database: 'test' };
    const snapshot = await createSnapshot(connection, { limit: 100 });
    expect(snapshot.id).toBeDefined();
    expect(snapshot.rowCount).toBeLessThanOrEqual(100);
  });

  test('sanitizes PII in snapshot data', async () => {
    const data = [{ email: 'user@example.com', name: 'John' }];
    const sanitized = await sanitizeData(data);
    expect(sanitized[0].email).toMatch(/^[a-z0-9]+@example\.com$/);
  });
});

describe('Snapshot loading', () => {
  test('loads snapshot by ID', async () => {
    const snapshot = await loadSnapshot('test-id');
    expect(snapshot.id).toBe('test-id');
    expect(snapshot.schema).toBeDefined();
  });
});
