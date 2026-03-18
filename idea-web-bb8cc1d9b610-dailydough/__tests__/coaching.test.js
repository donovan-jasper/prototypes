import { generatePersonalizedInsights, getCategoryBreakdown, getSpendingTrends } from '../services/coaching';
import { getDatabase, initDatabase } from '../services/database';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn()
  }))
}));

describe('Coaching Service', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('generatePersonalizedInsights returns array', async () => {
    const insights = await generatePersonalizedInsights();
    expect(Array.isArray(insights)).toBe(true);
  });

  test('getCategoryBreakdown returns array with percentage', async () => {
    const breakdown = await getCategoryBreakdown();
    expect(Array.isArray(breakdown)).toBe(true);
    if (breakdown.length > 0) {
      expect(breakdown[0]).toHaveProperty('percentage');
    }
  });

  test('getSpendingTrends returns 6 months of data', async () => {
    const trends = await getSpendingTrends();
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBe(6);
    if (trends.length > 0) {
      expect(trends[0]).toHaveProperty('month');
      expect(trends[0]).toHaveProperty('total');
    }
  });
});
