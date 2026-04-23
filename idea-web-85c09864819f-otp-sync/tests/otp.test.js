import { generateOTP, validateOTP } from '../app/utils/otp';

describe('OTP Utilities', () => {
  const testSecret = 'JBSWY3DPEHPK3PXP';

  test('generateOTP produces a 6-digit code', () => {
    const otp = generateOTP(testSecret);
    expect(otp).toMatch(/^\d{6}$/);
  });

  test('validateOTP correctly verifies generated OTP', () => {
    const otp = generateOTP(testSecret);
    expect(validateOTP(testSecret, otp)).toBe(true);
  });

  test('validateOTP rejects invalid OTP', () => {
    expect(validateOTP(testSecret, '123456')).toBe(false);
  });

  test('validateOTP accepts OTPs within time window', () => {
    // This test assumes the OTP generation and validation happen within the same 30-second window
    const otp = generateOTP(testSecret);
    expect(validateOTP(testSecret, otp)).toBe(true);
  });

  test('generateOTP throws error for invalid secret', () => {
    expect(() => generateOTP('invalid-secret')).toThrow();
  });
});
