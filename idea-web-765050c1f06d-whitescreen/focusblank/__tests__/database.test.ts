import { openDatabase, saveFocusMode, getFocusModes } from '../utils/database';

describe('Database operations', () => {
  it('should save and retrieve focus modes', async () => {
    const db = await openDatabase();
    const mode = {
      id: '1',
      name: 'Work',
      color: '#2C3E50',
      allowedApps: ['mail', 'calendar'],
    };

    await saveFocusMode(db, mode);
    const modes = await getFocusModes(db);

    expect(modes).toHaveLength(1);
    expect(modes[0].name).toBe('Work');
  });
});
