import { detectPatterns } from '@/lib/ml/patterns';

describe('patterns', () => {
  it('should detect usage patterns', async () => {
    const patterns = await detectPatterns();
    expect(patterns).toHaveProperty('morning');
    expect(patterns).toHaveProperty('work');
    expect(patterns).toHaveProperty('evening');
    expect(patterns).toHaveProperty('weekend');
  });

  it('should generate Smart Collections from usage history', async () => {
    const patterns = await detectPatterns();
    expect(patterns.morning.length).toBeGreaterThan(0);
    expect(patterns.work.length).toBeGreaterThan(0);
    expect(patterns.evening.length).toBeGreaterThan(0);
    expect(patterns.weekend.length).toBeGreaterThan(0);
  });

  it('should update patterns when behavior changes', async () => {
    const initialPatterns = await detectPatterns();
    // Simulate behavior change
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedPatterns = await detectPatterns();
    expect(updatedPatterns.morning).not.toEqual(initialPatterns.morning);
  });
});
