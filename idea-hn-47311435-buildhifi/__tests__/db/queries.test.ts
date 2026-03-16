import * as SQLite from 'expo-sqlite';
import { getComponents, getBuilds, getBuildById, createBuild, updateBuild } from '@/lib/db/queries';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    getAllAsync: jest.fn((sql: string) => {
      if (sql.includes('SELECT * FROM components')) {
        return Promise.resolve([{ id: 1, name: 'Test Component' }]);
      } else if (sql.includes('SELECT * FROM builds')) {
        return Promise.resolve([{ id: 1, name: 'Test Build' }]);
      }
      return Promise.resolve([]);
    }),
    getFirstAsync: jest.fn(() => Promise.resolve({ id: 1, name: 'Test Build' })),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
  })),
}));

describe('Database Queries', () => {
  test('getComponents returns components', async () => {
    const components = await getComponents();
    expect(components).toEqual([{ id: 1, name: 'Test Component' }]);
  });

  test('getBuilds returns builds', async () => {
    const builds = await getBuilds();
    expect(builds).toEqual([{ id: 1, name: 'Test Build' }]);
  });

  test('getBuildById returns a build', async () => {
    const build = await getBuildById(1);
    expect(build).toEqual({ id: 1, name: 'Test Build' });
  });

  test('createBuild creates a build', async () => {
    const buildId = await createBuild('New Build');
    expect(buildId).toBe(1);
  });

  test('updateBuild updates a build', async () => {
    const result = await updateBuild(1, 'Updated Build');
    expect(result.changes).toBe(1);
  });
});
