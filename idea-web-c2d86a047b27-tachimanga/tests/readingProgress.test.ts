import { saveReadingProgress, getReadingProgress, getAllContentWithProgress } from '../app/utils/offlineLibrary';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
    getFirstAsync: jest.fn((query: string) => {
      if (query.includes('reading_progress')) {
        return Promise.resolve({ 
          id: 1, 
          content_id: 1, 
          scroll_position: 150.5, 
          percentage_complete: 45.2,
          last_updated: Date.now()
        });
      }
      return Promise.resolve({ id: 1, title: 'Test Manga', text: 'Test content' });
    }),
    getAllAsync: jest.fn(() => Promise.resolve([
      { 
        id: 1, 
        title: 'Test Manga', 
        text: 'Test content',
        scroll_position: 150.5,
        percentage_complete: 45.2
      }
    ]))
  }))
}));

test('saves reading progress', async () => {
  await saveReadingProgress(1, 150.5, 45.2);
  const progress = await getReadingProgress(1);
  expect(progress).toHaveProperty('scroll_position');
  expect(progress).toHaveProperty('percentage_complete');
});

test('retrieves reading progress', async () => {
  const progress = await getReadingProgress(1);
  expect(progress.scroll_position).toBe(150.5);
  expect(progress.percentage_complete).toBe(45.2);
});

test('gets all content with progress', async () => {
  const content = await getAllContentWithProgress();
  expect(content).toHaveLength(1);
  expect(content[0]).toHaveProperty('percentage_complete');
  expect(content[0].percentage_complete).toBe(45.2);
});
