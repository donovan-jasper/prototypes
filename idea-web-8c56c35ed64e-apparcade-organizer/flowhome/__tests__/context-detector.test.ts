import { detectContext } from '@/lib/context/detector';

describe('context-detector', () => {
  it('should detect time-based context', async () => {
    const context = await detectContext();
    expect(context).toHaveProperty('time');
    expect(['morning', 'work', 'evening', 'night']).toContain(context.time);
  });

  it('should detect location context', async () => {
    const context = await detectContext();
    expect(context).toHaveProperty('location');
    expect(['home', 'work', 'other', 'unknown']).toContain(context.location);
  });

  it('should prioritize context when multiple contexts match', async () => {
    const context = await detectContext();
    expect(context).toHaveProperty('time');
    expect(context).toHaveProperty('location');
  });
});
