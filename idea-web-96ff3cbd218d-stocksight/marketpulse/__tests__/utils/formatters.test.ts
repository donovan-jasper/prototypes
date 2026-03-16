import { formatCurrency, formatPercentage, formatRelativeTime } from '../../utils/formatters';

describe('Formatters', () => {
  it('should format currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('should format percentage', () => {
    expect(formatPercentage(0.5)).toBe('50.00%');
  });

  it('should format relative time', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    expect(formatRelativeTime(date)).toBe('2 hours ago');
  });
});
