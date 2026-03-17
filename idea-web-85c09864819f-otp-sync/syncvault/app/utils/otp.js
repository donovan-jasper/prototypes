import * as SQLite from 'expo-sqlite';
import { encrypt, decrypt } from './encryption';
import CryptoJS from 'crypto-js';

const db = SQLite.openDatabase('syncvault.db');

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
const generateTOTP = (secret, timeStep = 30) => {
  try {
    // Decode base32 secret
    const key = base32Decode(secret);
    
    // Get current time counter (Unix timestamp / 30)
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);
    
    // Convert counter to 8-byte buffer
    const counterHex = counter.toString(16).padStart(16, '0');
    const counterBytes = CryptoJS.enc.Hex.parse(counterHex);
    
    // Generate HMAC-SHA1
    const hmac = CryptoJS.HmacSHA1(counterBytes, CryptoJS.enc.Latin1.parse(key));
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);
    
    // Dynamic truncation
    const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
    const truncatedHash = hmacHex.substr(offset * 2, 8);
    const code = parseInt(truncatedHash, 16) & 0x7fffffff;
    
    // Return 6-digit code
    return (code % 1000000).toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return '000000';
  }
};

// Calculate time remaining in current 30-second window
const getTimeRemaining = () => {
  const epoch = Math.floor(Date.now() / 1000);
  return 30 - (epoch % 30);
};

// Mock OTP accounts (in real app, these would come from database)
const mockAccounts = [
  { id: '1', name: 'Google', secret: 'JBSWY3DPEHPK3PXP' },
  { id: '2', name: 'GitHub', secret: 'JBSWY3DPEHPK3PXP' },
  { id: '3', name: 'AWS', secret: 'JBSWY3DPEHPK3PXP' },
];

export const generateOTP = async () => {
  // Generate OTP codes for all accounts
  const otps = mockAccounts.map(account => ({
    id: account.id,
    name: account.name,
    code: generateTOTP(account.secret),
    timeRemaining: getTimeRemaining(),
  }));

  return otps;
};

export const validateOTP = (secret, otp) => {
  const currentOTP = generateTOTP(secret);
  return currentOTP === otp;
};
