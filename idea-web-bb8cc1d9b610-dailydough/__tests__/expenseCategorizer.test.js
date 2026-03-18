import { categorizeExpense, getCategories, recordCategoryCorrection } from '../services/expenseCategorizer';
import { initDatabase } from '../services/database';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    runAsync: jest.fn()
  }))
}));

describe('Expense Categorizer', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('categorizes food-related expenses correctly', async () => {
    const result = await categorizeExpense('Starbucks coffee');
    expect(result.category).toBe('Food & Dining');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.source).toBe('keyword');
  });

  test('categorizes transportation expenses correctly', async () => {
    const result = await categorizeExpense('Uber ride to work');
    expect(result.category).toBe('Transportation');
    expect(result.source).toBe('keyword');
  });

  test('categorizes shopping expenses correctly', async () => {
    const result = await categorizeExpense('Amazon order');
    expect(result.category).toBe('Shopping');
  });

  test('categorizes entertainment expenses correctly', async () => {
    const result = await categorizeExpense('Netflix subscription');
    expect(result.category).toBe('Entertainment');
  });

  test('categorizes bills and utilities correctly', async () => {
    const result = await categorizeExpense('Electric bill payment');
    expect(result.category).toBe('Bills & Utilities');
  });

  test('categorizes healthcare expenses correctly', async () => {
    const result = await categorizeExpense('Doctor appointment');
    expect(result.category).toBe('Healthcare');
  });

  test('categorizes personal care expenses correctly', async () => {
    const result = await categorizeExpense('Gym membership');
    expect(result.category).toBe('Personal Care');
  });

  test('returns Other for unrecognized expenses', async () => {
    const result = await categorizeExpense('Random expense');
    expect(result.category).toBe('Other');
  });

  test('handles empty or invalid input', async () => {
    const result1 = await categorizeExpense('');
    expect(result1.category).toBe('Other');
    
    const result2 = await categorizeExpense(null);
    expect(result2.category).toBe('Other');
    
    const result3 = await categorizeExpense(undefined);
    expect(result3.category).toBe('Other');
  });

  test('is case insensitive', async () => {
    const result1 = await categorizeExpense('UBER RIDE');
    expect(result1.category).toBe('Transportation');
    
    const result2 = await categorizeExpense('netflix');
    expect(result2.category).toBe('Entertainment');
    
    const result3 = await categorizeExpense('StArBuCkS');
    expect(result3.category).toBe('Food & Dining');
  });

  test('returns confidence score', async () => {
    const result = await categorizeExpense('Starbucks coffee');
    expect(result).toHaveProperty('confidence');
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('returns source information', async () => {
    const result = await categorizeExpense('Starbucks coffee');
    expect(result).toHaveProperty('source');
    expect(['keyword', 'learned', 'default']).toContain(result.source);
  });

  test('getCategories returns all categories', () => {
    const categories = getCategories();
    expect(categories).toHaveLength(8);
    expect(categories).toContain('Food & Dining');
    expect(categories).toContain('Transportation');
    expect(categories).toContain('Other');
  });
});
