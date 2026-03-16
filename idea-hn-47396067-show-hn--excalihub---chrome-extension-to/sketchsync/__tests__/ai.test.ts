import { generateDiagram, polishSketch } from '../lib/ai';

describe('AI diagram generation', () => {
  it('should generate diagram from text prompt', async () => {
    const result = await generateDiagram('Create a simple flowchart');

    expect(result.elements).toBeDefined();
    expect(result.elements.length).toBeGreaterThan(0);
  });
});
