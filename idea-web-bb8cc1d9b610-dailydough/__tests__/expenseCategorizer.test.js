import { categorizeExpense, getCategories } from '../services/expenseCategorizer';

describe('Expense Categorizer', () => {
  test('categorizes food-related expenses correctly', () => {
    expect(categorizeExpense('Starbucks coffee')).toBe('Food & Dining');
    expect(categorizeExpense('McDonald\'s lunch')).toBe('Food & Dining');
    expect(categorizeExpense('Grocery shopping at Whole Foods')).toBe('Food & Dining');
    expect(categorizeExpense('Pizza delivery')).toBe('Food & Dining');
  });

  test('categorizes transportation expenses correctly', () => {
    expect(categorizeExpense('Uber ride to work')).toBe('Transportation');
    expect(categorizeExpense('Gas station fill up')).toBe('Transportation');
    expect(categorizeExpense('Lyft to airport')).toBe('Transportation');
    expect(categorizeExpense('Parking fee')).toBe('Transportation');
  });

  test('categorizes shopping expenses correctly', () => {
    expect(categorizeExpense('Amazon order')).toBe('Shopping');
    expect(categorizeExpense('Target purchase')).toBe('Shopping');
    expect(categorizeExpense('New shoes from Nike')).toBe('Shopping');
  });

  test('categorizes entertainment expenses correctly', () => {
    expect(categorizeExpense('Netflix subscription')).toBe('Entertainment');
    expect(categorizeExpense('Spotify premium')).toBe('Entertainment');
    expect(categorizeExpense('Movie tickets')).toBe('Entertainment');
  });

  test('categorizes bills and utilities correctly', () => {
    expect(categorizeExpense('Electric bill payment')).toBe('Bills & Utilities');
    expect(categorizeExpense('Internet service')).toBe('Bills & Utilities');
    expect(categorizeExpense('Rent payment')).toBe('Bills & Utilities');
  });

  test('categorizes healthcare expenses correctly', () => {
    expect(categorizeExpense('Doctor appointment')).toBe('Healthcare');
    expect(categorizeExpense('CVS pharmacy')).toBe('Healthcare');
    expect(categorizeExpense('Dental checkup')).toBe('Healthcare');
  });

  test('categorizes personal care expenses correctly', () => {
    expect(categorizeExpense('Gym membership')).toBe('Personal Care');
    expect(categorizeExpense('Haircut at salon')).toBe('Personal Care');
    expect(categorizeExpense('Spa treatment')).toBe('Personal Care');
  });

  test('returns Other for unrecognized expenses', () => {
    expect(categorizeExpense('Random expense')).toBe('Other');
    expect(categorizeExpense('Unknown purchase')).toBe('Other');
  });

  test('handles empty or invalid input', () => {
    expect(categorizeExpense('')).toBe('Other');
    expect(categorizeExpense(null)).toBe('Other');
    expect(categorizeExpense(undefined)).toBe('Other');
  });

  test('is case insensitive', () => {
    expect(categorizeExpense('UBER RIDE')).toBe('Transportation');
    expect(categorizeExpense('netflix')).toBe('Entertainment');
    expect(categorizeExpense('StArBuCkS')).toBe('Food & Dining');
  });

  test('getCategories returns all categories', () => {
    const categories = getCategories();
    expect(categories).toHaveLength(8);
    expect(categories).toContain('Food & Dining');
    expect(categories).toContain('Transportation');
    expect(categories).toContain('Other');
  });
});
