import { validateRecipient, validateMessage, validateAmount } from '../utils/validation';

describe('Validation Utils', () => {
  it('should validate recipient name', () => {
    expect(validateRecipient('Alice')).toBe(true);
    expect(validateRecipient('')).toBe(false);
    expect(validateRecipient('A')).toBe(false); // Too short
  });

  it('should validate message length', () => {
    expect(validateMessage('Happy Birthday!')).toBe(true);
    expect(validateMessage('')).toBe(false);
    expect(validateMessage('a'.repeat(501))).toBe(false); // Too long
  });

  it('should validate gift amount', () => {
    expect(validateAmount(10)).toBe(true);
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-5)).toBe(false);
    expect(validateAmount(1001)).toBe(false); // Over max
  });
});
