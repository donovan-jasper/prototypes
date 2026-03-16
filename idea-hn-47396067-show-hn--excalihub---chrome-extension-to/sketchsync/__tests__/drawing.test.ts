import { serializeCanvas, deserializeCanvas, exportToPNG } from '../lib/drawing';

describe('Drawing serialization', () => {
  it('should serialize and deserialize canvas data', () => {
    const canvasData = { elements: [{ type: 'rect', x: 0, y: 0 }] };
    const serialized = serializeCanvas(canvasData);
    const deserialized = deserializeCanvas(serialized);

    expect(deserialized.elements.length).toBe(1);
    expect(deserialized.elements[0].type).toBe('rect');
  });
});
