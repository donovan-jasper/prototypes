import { parseCSV, detectColumnTypes } from '../lib/csv-parser';

describe('CSV Parser', () => {
  it('parses valid CSV with headers', async () => {
    const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const result = await parseCSV(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.columns).toEqual(['name', 'age', 'city']);
  });

  it('detects column types correctly', () => {
    const rows = [
      { age: '30', price: '19.99', active: 'true' },
      { age: '25', price: '29.99', active: 'false' }
    ];
    const types = detectColumnTypes(rows);
    expect(types.age).toBe('INTEGER');
    expect(types.price).toBe('REAL');
    expect(types.active).toBe('BOOLEAN');
  });
});
