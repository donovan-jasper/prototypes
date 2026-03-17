import { describe, it, expect } from '@jest/globals';
import { calculateTotal, validatePaymentAmount, formatCurrency } from '../lib/payments';

describe('Payment Processing', () => {
  it('should calculate total with fees', () => {
    const total = calculateTotal(100, 0.1); // 10% fee
    expect(total).toBe(110);
  });

  it('should calculate total without fees', () => {
    const total = calculateTotal(100, 0);
    expect(total).toBe(100);
  });

  it('should validate minimum payment amount', () => {
    expect(validatePaymentAmount(5)).toBe(false);
    expect(validatePaymentAmount(24.99)).toBe(false);
    expect(validatePaymentAmount(25)).toBe(true);
  });

  it('should validate maximum payment amount', () => {
    expect(validatePaymentAmount(5000)).toBe(false);
    expect(validatePaymentAmount(1001)).toBe(false);
    expect(validatePaymentAmount(1000)).toBe(true);
    expect(validatePaymentAmount(500)).toBe(true);
  });

  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(99.99)).toBe('$99.99');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
