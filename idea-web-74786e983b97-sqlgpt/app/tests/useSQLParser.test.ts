import { renderHook, act } from '@testing-library/react-hooks';
import useSQLParser from '../hooks/useSQLParser';

describe('useSQLParser', () => {
  it('should initialize with empty query', () => {
    const { result } = renderHook(() => useSQLParser());
    expect(result.current.query).toBe('');
  });

  it('should parse simple table queries', () => {
    const { result } = renderHook(() => useSQLParser());

    act(() => {
      result.current.parseNaturalQuery('Show sales data');
    });
    expect(result.current.query).toBe('SELECT * FROM sales;');

    act(() => {
      result.current.parseNaturalQuery('Get customer information');
    });
    expect(result.current.query).toBe('SELECT * FROM customers;');
  });

  it('should handle date filters', () => {
    const { result } = renderHook(() => useSQLParser());

    act(() => {
      result.current.parseNaturalQuery('Show sales from last quarter');
    });
    expect(result.current.query).toContain('SELECT * FROM sales WHERE date BETWEEN');

    act(() => {
      result.current.parseNaturalQuery('Show orders from last month');
    });
    expect(result.current.query).toContain('SELECT * FROM orders WHERE date BETWEEN');
  });

  it('should handle aggregation queries', () => {
    const { result } = renderHook(() => useSQLParser());

    act(() => {
      result.current.parseNaturalQuery('Calculate total sales');
    });
    expect(result.current.query).toBe('SELECT SUM(amount) as total_sales FROM sales;');

    act(() => {
      result.current.parseNaturalQuery('Count total orders');
    });
    expect(result.current.query).toBe('SELECT COUNT(*) as total_orders FROM orders;');
  });

  it('should handle sorting', () => {
    const { result } = renderHook(() => useSQLParser());

    act(() => {
      result.current.parseNaturalQuery('Show sales sorted by date');
    });
    expect(result.current.query).toContain('SELECT * FROM sales ORDER BY date;');
  });

  it('should return default query for unknown input', () => {
    const { result } = renderHook(() => useSQLParser());

    act(() => {
      result.current.parseNaturalQuery('Random query');
    });
    expect(result.current.query).toBe('SELECT * FROM table;');
  });
});
