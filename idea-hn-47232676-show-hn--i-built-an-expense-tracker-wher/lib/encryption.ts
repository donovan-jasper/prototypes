import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export const generateKeyPair = (): KeyPair => {
  // In a real implementation, you would use proper asymmetric encryption
  // For this prototype, we'll use symmetric encryption with a shared key
  const key = Crypto.getRandomBytes(32); // 256-bit key
  return {
    publicKey: Crypto.encodeBase64(key),
    privateKey: Crypto.encodeBase64(key),
  };
};

export const encryptMessage = async (message: string, key: string): Promise<string> => {
  try {
    const iv = Crypto.getRandomBytes(16); // 128-bit IV
    const keyBytes = Crypto.decodeBase64(key);

    const encrypted = await Crypto.encryptAsync(
      keyBytes,
      iv,
      Crypto.CryptoEncoding.UTF8,
      message,
      Crypto.CryptoEncoding.UTF8
    );

    // Combine IV and encrypted data
    return Crypto.encodeBase64(iv + encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptMessage = async (encryptedData: string, key: string): Promise<string> => {
  try {
    const combined = Crypto.decodeBase64(encryptedData);
    const iv = combined.slice(0, 16);
    const encrypted = combined.slice(16);
    const keyBytes = Crypto.decodeBase64(key);

    return await Crypto.decryptAsync(
      keyBytes,
      iv,
      Crypto.CryptoEncoding.UTF8,
      encrypted,
      Crypto.CryptoEncoding.UTF8
    );
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

export const storeEncryptionKey = async (key: string) => {
  try {
    await SecureStore.setItemAsync('encryptionKey', key);
  } catch (error) {
    console.error('Error storing encryption key:', error);
    throw error;
  }
};

export const getEncryptionKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('encryptionKey');
  } catch (error) {
    console.error('Error retrieving encryption key:', error);
    return null;
  }
};
