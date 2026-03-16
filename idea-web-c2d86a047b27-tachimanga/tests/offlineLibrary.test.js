import { downloadContent } from '../app/utils/offlineLibrary';

test('downloads content and stores locally', async () => {
  const mockContent = { id: '123', title: 'Test Manga', text: 'This is a test manga.' };
  const result = await downloadContent(mockContent);
  expect(result).toHaveProperty('localPath');
});
