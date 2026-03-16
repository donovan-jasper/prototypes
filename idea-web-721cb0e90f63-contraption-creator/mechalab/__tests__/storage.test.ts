import { saveContraption, loadContraption, deleteContraption } from '../lib/storage';

describe('SQLite Storage', () => {
  it('saves and loads a contraption', async () => {
    const contraption = {
      name: 'Test Machine',
      parts: [{ type: 'RAMP', x: 100, y: 100 }],
    };
    const id = await saveContraption(contraption);
    const loaded = await loadContraption(id);
    expect(loaded.name).toBe('Test Machine');
    expect(loaded.parts).toHaveLength(1);
  });

  it('deletes a contraption', async () => {
    const id = await saveContraption({ name: 'Temp', parts: [] });
    await deleteContraption(id);
    const loaded = await loadContraption(id);
    expect(loaded).toBeNull();
  });
});
