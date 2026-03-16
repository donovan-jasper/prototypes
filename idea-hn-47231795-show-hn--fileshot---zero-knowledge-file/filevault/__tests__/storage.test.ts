import { saveFile, getFile, deleteFile } from '../lib/storage';

describe('Storage', () => {
  it('saves and retrieves file', async () => {
    const fileId = await saveFile('test.txt', 'content');
    const retrieved = await getFile(fileId);
    expect(retrieved.name).toBe('test.txt');
  });

  it('deletes file completely', async () => {
    const fileId = await saveFile('temp.txt', 'data');
    await deleteFile(fileId);
    await expect(getFile(fileId)).rejects.toThrow();
  });
});
