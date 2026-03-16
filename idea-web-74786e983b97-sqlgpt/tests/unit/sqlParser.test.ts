import { parseNaturalQuery } from '../../app/utils/sqlParser';

test('converts natural query to SQL', () => {
  const input = "Show me sales last quarter";
  const expected = "SELECT * FROM sales WHERE date BETWEEN '2023-10-01' AND '2023-12-31';";
  expect(parseNaturalQuery(input)).toBe(expected);
});

test('handles different table names', () => {
  const input = "Show me customers today";
  const expected = "SELECT * FROM customers WHERE date = date('now');";
  expect(parseNaturalQuery(input)).toBe(expected);
});

test('handles order by clauses', () => {
  const input = "Show me sales sorted by date";
  const expected = "SELECT * FROM sales ORDER BY date;";
  expect(parseNaturalQuery(input)).toBe(expected);
});
