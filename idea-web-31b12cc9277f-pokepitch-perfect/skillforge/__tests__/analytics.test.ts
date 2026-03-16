import { calculateImprovement, generateWeeklyReport } from '../lib/analytics';

describe('calculateImprovement', () => {
  it('calculates improvement correctly', async () => {
    // Mock user stats with history
    const improvement = await calculateImprovement();
    expect(improvement).toBeGreaterThanOrEqual(0);
  });
});

describe('generateWeeklyReport', () => {
  it('generates a report', async () => {
    const report = await generateWeeklyReport();
    expect(report).toContain('Weekly Improvement Report');
  });
});
