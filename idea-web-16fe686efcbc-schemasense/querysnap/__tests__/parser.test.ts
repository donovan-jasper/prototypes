import { parseCSV, parseExcel, detectSchema } from '../lib/parser';

describe('File Parsing', () => {
  it('parses CSV into rows', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = parseCSV(csv);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ name: 'Alice', age: '30' });
  });

  it('detects schema from parsed data', () => {
    const data = [
      { id: 1, name: 'Alice', price: 19.99 },
      { id: 2, name: 'Bob', price: 29.99 }
    ];
    const schema = detectSchema(data);
    expect(schema.columns).toEqual(['id', 'name', 'price']);
    expect(schema.types.id).toBe('INTEGER');
    expect(schema.types.price).toBe('REAL');
  });
});
