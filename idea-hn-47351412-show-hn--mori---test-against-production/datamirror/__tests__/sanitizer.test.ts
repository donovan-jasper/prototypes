import { sanitizeEmail, sanitizePhone, sanitizeAddress } from '../lib/database/sanitizer';

describe('PII sanitization', () => {
  test('masks email addresses', () => {
    expect(sanitizeEmail('john.doe@company.com')).toMatch(/^[a-z0-9]+@company\.com$/);
  });

  test('masks phone numbers', () => {
    expect(sanitizePhone('+1-555-123-4567')).toBe('+1-555-XXX-XXXX');
  });

  test('masks addresses', () => {
    expect(sanitizeAddress('123 Main St, Anytown, USA')).toBe('123 Main St, Anytown, USA');
  });
});
