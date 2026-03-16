import { initDatabase, saveMode, getModes } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('saves and retrieves modes', async () => {
    const mode = { name: 'Focus', appIds: ['com.app1'], color: '#FF0000' };
    await saveMode(mode);
    const modes = await getModes();
    expect(modes).toContainEqual(expect.objectContaining(mode));
  });
});
