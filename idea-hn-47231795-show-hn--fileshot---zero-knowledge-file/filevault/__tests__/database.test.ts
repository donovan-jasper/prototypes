import { initDatabase, addFile, getFiles, deleteExpiredFiles } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('stores file metadata', async () => {
    await addFile({ id: '1', name: 'test.pdf', size: 1024 });
    const files = await getFiles();
    expect(files.length).toBeGreaterThan(0);
  });

  it('removes expired files', async () => {
    const expiredTime = Date.now() - 1000;
    await addFile({ id: '2', name: 'old.txt', expiresAt: expiredTime });
    await deleteExpiredFiles();
    const files = await getFiles();
    expect(files.find(f => f.id === '2')).toBeUndefined();
  });
});
