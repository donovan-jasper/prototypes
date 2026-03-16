import { initDatabase, getProjects } from '../lib/database';

describe('Database', () => {
  it('should initialize SQLite database', async () => {
    const db = await initDatabase();
    expect(db).toBeDefined();
  });

  it('should retrieve all projects', async () => {
    const projects = await getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });
});
