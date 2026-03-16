import * as Crypto from 'expo-crypto';

export const generateKeyPair = () => {
  const publicKey = Crypto.getRandomBytes(32).toString('hex');
  const privateKey = Crypto.getRandomBytes(32).toString('hex');
  return { publicKey, privateKey };
};

export const encryptMessage = (message, key) => {
  const encrypted = Crypto.encrypt(message, key);
  return encrypted;
};

export const decryptMessage = (encrypted, key) => {
  const decrypted = Crypto.decrypt(encrypted, key);
  return decrypted;
};
