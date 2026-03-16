import * as SecureStore from 'expo-secure-store';
import { encryptCredentials, decryptCredentials } from '../utils/encryption';

const CREDENTIALS_KEY = 'database_credentials';

export const saveCredentials = async (credentials: any) => {
  const encrypted = encryptCredentials(JSON.stringify(credentials));
  await SecureStore.setItemAsync(CREDENTIALS_KEY, encrypted);
};

export const getCredentials = async () => {
  const encrypted = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  if (!encrypted) return null;
  const decrypted = decryptCredentials(encrypted);
  return JSON.parse(decrypted);
};

export const clearCredentials = async () => {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
};
