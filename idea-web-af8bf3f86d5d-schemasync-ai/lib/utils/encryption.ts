import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'db_credentials_key';

const getEncryptionKey = async (): Promise<string> => {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY);

  if (!key) {
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );
    await SecureStore.setItemAsync(ENCRYPTION_KEY, key);
  }

  return key;
};

export const encryptCredentials = async (credentials: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = Crypto.getRandomBytes(16);

    const ciphertext = await Crypto.encryptAsync(
      key,
      credentials,
      {
        iv,
        name: Crypto.CryptoEncryptionAlgorithm.AES_CBC_PKCS7,
      }
    );

    return JSON.stringify({
      iv: iv.toString('base64'),
      ciphertext
    });
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt credentials');
  }
};

export const decryptCredentials = async (encryptedData: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const { iv, ciphertext } = JSON.parse(encryptedData);

    const decrypted = await Crypto.decryptAsync(
      key,
      ciphertext,
      {
        iv: Buffer.from(iv, 'base64'),
        name: Crypto.CryptoEncryptionAlgorithm.AES_CBC_PKCS7,
      }
    );

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt credentials');
  }
};
