import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'your-encryption-key-here'; // In production, this should be securely stored

export const encryptData = async (data) => {
  try {
    const iv = Crypto.getRandomBytes(16); // Generate random IV
    const cipher = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_KEY + iv.toString('base64')
    );
    const key = cipher.substring(0, 32); // AES-256 requires 32 bytes key

    const encrypted = await Crypto.encryptAsync(
      'AES-CBC',
      key,
      data,
      { iv: iv.toString('base64') }
    );

    return `${iv.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptData = async (encryptedData) => {
  try {
    const [ivBase64, encrypted] = encryptedData.split(':');
    const iv = ivBase64;

    const cipher = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_KEY + iv
    );
    const key = cipher.substring(0, 32);

    const decrypted = await Crypto.decryptAsync(
      'AES-CBC',
      key,
      encrypted,
      { iv: iv }
    );

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};
