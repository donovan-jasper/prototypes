import { generateOTP, validateOTP } from '../app/utils/otp';

test('OTP generation and validation', () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const otp = generateOTP(secret);
  expect(validateOTP(secret, otp)).toBe(true);
});
