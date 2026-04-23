import CryptoJS from 'crypto-js';

// Base32 decode function
const base32Decode = (base32) => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  base32 = base32.replace(/=+$/, '').toUpperCase();

  for (let i = 0; i < base32.length; i++) {
    const val = base32Chars.indexOf(base32.charAt(i));
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    hex += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
  }

  return hex;
};

// Generate TOTP code
const generateOTPInternal = (secret, timeStep = 30, timestamp = null) => {
  try {
    const key = base32Decode(secret);
    const epoch = timestamp ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);

    const counterHex = counter.toString(16).padStart(16, '0');
    const counterBytes = CryptoJS.enc.Hex.parse(counterHex);

    const hmac = CryptoJS.HmacSHA1(counterBytes, CryptoJS.enc.Latin1.parse(key));
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);

    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const truncatedHash = hmacHex.substr(offset * 2, 8);
    const code = parseInt(truncatedHash, 16) & 0x7fffffff;

    return (code % 1000000).toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return '000000';
  }
};

export const generateOTP = (secret, timeStep = 30) => {
  return generateOTPInternal(secret, timeStep);
};

// Calculate time remaining in current 30-second window
export const getTimeRemaining = () => {
  const epoch = Math.floor(Date.now() / 1000);
  return 30 - (epoch % 30);
};

export const validateOTP = (secret, otp, timeStep = 30) => {
  // Check current OTP
  const currentOTP = generateOTPInternal(secret, timeStep);
  if (currentOTP === otp) return true;

  // Check previous OTP (in case of clock skew)
  const previousOTP = generateOTPInternal(secret, timeStep, Date.now() - timeStep * 1000);
  return previousOTP === otp;
};
