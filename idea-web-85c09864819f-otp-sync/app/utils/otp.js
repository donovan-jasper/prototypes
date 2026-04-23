import { generateTotp, verifyTotp } from 'react-native-totp';

/**
 * Generates a TOTP code based on the provided secret
 * @param {string} secret - Base32 encoded secret key
 * @returns {string} Generated 6-digit OTP code
 */
export const generateOTP = (secret) => {
  try {
    return generateTotp(secret, {
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new Error('Failed to generate OTP');
  }
};

/**
 * Validates a TOTP code against the provided secret
 * @param {string} secret - Base32 encoded secret key
 * @param {string} token - The OTP code to validate
 * @returns {boolean} True if the token is valid, false otherwise
 */
export const validateOTP = (secret, token) => {
  try {
    return verifyTotp(token, secret, {
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
      window: 1, // Accepts current and previous/next token
    });
  } catch (error) {
    console.error('Error validating OTP:', error);
    return false;
  }
};
