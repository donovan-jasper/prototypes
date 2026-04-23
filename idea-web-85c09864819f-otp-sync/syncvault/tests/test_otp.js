import { generateOTP, validateOTP, getTimeRemaining } from '../app/utils/otp';

describe('OTP Functions', () => {
  const testSecret = 'JBSWY3DPEHPK3PXP';

  test('generateOTP produces a 6-digit code', () => {
    const otp = generateOTP(testSecret);
    expect(otp).toMatch(/^\d{6}$/);
  });

  test('validateOTP correctly verifies current OTP', () => {
    const otp = generateOTP(testSecret);
    expect(validateOTP(testSecret, otp)).toBe(true);
  });

  test('validateOTP correctly handles previous OTP', () => {
    // Generate OTP for previous time window
    const previousTimestamp = Date.now() - 30000;
    const previousOTP = generateOTP(testSecret, 30, previousTimestamp);

    // Validate it should work
    expect(validateOTP(testSecret, previousOTP)).toBe(true);
  });

  test('getTimeRemaining returns a value between 0 and 30', () => {
    const remaining = getTimeRemaining();
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThanOrEqual(30);
  });

  test('validateOTP rejects invalid OTPs', () => {
    expect(validateOTP(testSecret, '123456')).toBe(false);
  });
});
