import { initDatabase, logAppUsage, getAppUsage, saveSmartCollection, getSmartCollections, saveFocusMode, getFocusModes, updateFocusMode } from '@/lib/database';

describe('database', () => {
  beforeAll(() => {
    initDatabase();
  });

  it('should create tables', async () => {
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    expect(usage).toBeDefined();
  });

  it('should perform CRUD operations for app usage logs', async () => {
    logAppUsage('com.example.app', 'Example App', Date.now(), 1000, 'morning', 'home');
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    expect(usage.length).toBeGreaterThan(0);
    expect(usage[0].package_name).toBe('com.example.app');
  });

  it('should query performance with 10k+ records', async () => {
    for (let i = 0; i < 10000; i++) {
      logAppUsage(`com.example.app${i}`, `Example App ${i}`, Date.now(), 1000, 'morning', 'home');
    }
    const start = Date.now();
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    const end = Date.now();
    expect(usage.length).toBeGreaterThan(10000);
    expect(end - start).toBeLessThan(1000);
  });

  it('should save and retrieve smart collections', async () => {
    saveSmartCollection('Morning Routine', JSON.stringify(['com.example.app1', 'com.example.app2']), Date.now());
    const collections = await new Promise((resolve) => getSmartCollections(resolve));
    expect(collections.length).toBeGreaterThan(0);
    expect(collections[0].name).toBe('Morning Routine');
  });

  it('should save and retrieve focus modes', async () => {
    saveFocusMode('Work', JSON.stringify(['com.example.app1', 'com.example.app2']), JSON.stringify(['com.example.app3', 'com.example.app4']), true);
    const modes = await new Promise((resolve) => getFocusModes(resolve));
    expect(modes.length).toBeGreaterThan(0);
    expect(modes[0].name).toBe('Work');
  });

  it('should update focus modes', async () => {
    saveFocusMode('Work', JSON.stringify(['com.example.app1', 'com.example.app2']), JSON.stringify(['com.example.app3', 'com.example.app4']), true);
    const modes = await new Promise((resolve) => getFocusModes(resolve));
    updateFocusMode(modes[0].id, false);
    const updatedModes = await new Promise((resolve) => getFocusModes(resolve));
    expect(updatedModes[0].is_active).toBe(0);
  });
});
