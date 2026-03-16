import { openDatabase, createDrawing, getDrawings, deleteDrawing } from '../lib/db';

describe('Database operations', () => {
  it('should create and retrieve a drawing', async () => {
    const drawing = await createDrawing({ title: 'Test', data: '{}' });
    expect(drawing.id).toBeDefined();

    const drawings = await getDrawings();
    expect(drawings.length).toBeGreaterThan(0);
  });

  it('should delete a drawing', async () => {
    const drawing = await createDrawing({ title: 'Delete me', data: '{}' });
    await deleteDrawing(drawing.id);

    const drawings = await getDrawings();
    expect(drawings.find(d => d.id === drawing.id)).toBeUndefined();
  });
});
