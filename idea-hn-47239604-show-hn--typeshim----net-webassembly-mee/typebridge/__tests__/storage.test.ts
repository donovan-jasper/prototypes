import { saveProject, loadProject, deleteProject } from '../lib/storage';

describe('Project Storage', () => {
  const mockProject = {
    id: 'test-123',
    name: 'Test Project',
    code: 'console.log("test");',
    createdAt: Date.now(),
  };

  it('should save project to SQLite', async () => {
    const result = await saveProject(mockProject);
    expect(result.success).toBe(true);
  });

  it('should load saved project', async () => {
    await saveProject(mockProject);
    const loaded = await loadProject('test-123');
    expect(loaded.name).toBe('Test Project');
  });

  it('should delete project', async () => {
    await saveProject(mockProject);
    await deleteProject('test-123');
    const loaded = await loadProject('test-123');
    expect(loaded).toBeNull();
  });
});
