import * as Crypto from 'expo-crypto';
import { QuickCrypto } from 'react-native-quick-crypto';

const ALGORITHM = 'AES-256-GCM';

export const generateKey = async () => {
  const key = await Crypto.getRandomBytes(32);
  return key;
};

export const encryptFile = async (data, key) => {
  const iv = await Crypto.getRandomBytes(12);
  const cipher = QuickCrypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    encryptedData: encrypted,
    authTag: authTag.toString('base64'),
  };
};

export const decryptFile = async (encrypted, key) => {
  const decipher = QuickCrypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));
  let decrypted = decipher.update(encrypted.encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
