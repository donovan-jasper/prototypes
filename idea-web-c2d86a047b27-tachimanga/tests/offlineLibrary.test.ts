import { downloadContent } from '../app/utils/offlineLibrary';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
    getFirstAsync: jest.fn(() => Promise.resolve({ id: 1, title: 'Test Manga', text: 'This is a test manga.' })),
    getAllAsync: jest.fn(() => Promise.resolve([]))
  }))
}));

test('downloads content and stores locally', async () => {
  const mockContent = { title: 'Test Manga', text: 'This is a test manga.' };
  const result = await downloadContent(mockContent);
  expect(result).toHaveProperty('localPath');
  expect(result.localPath).toBe(1);
});
