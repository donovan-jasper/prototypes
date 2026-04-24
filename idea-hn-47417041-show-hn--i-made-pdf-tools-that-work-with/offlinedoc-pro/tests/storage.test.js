import { initDB, saveFile, getFiles } from '../app/utils/storage';

beforeAll(() => {
  initDB();
});

test('saves and retrieves a file', async () => {
  const fileName = 'test.pdf';
  const fileData = new Uint8Array([/* PDF data */]);
  await saveFile(fileName, fileData);
  const files = await getFiles();
  expect(files.length).toBeGreaterThan(0);
  expect(files[0].name).toBe(fileName);
});
