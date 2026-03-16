import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'your-encryption-key-here'; // In production, generate this securely

export const encryptCredentials = (data: string) => {
  const iv = Crypto.getRandomBytes(16);
  const cipher = Crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};

export const decryptCredentials = (encryptedData: string) => {
  const [ivBase64, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = Crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
