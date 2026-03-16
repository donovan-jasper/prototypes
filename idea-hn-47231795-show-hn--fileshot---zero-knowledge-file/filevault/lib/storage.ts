import * as FileSystem from 'expo-file-system';
import { generateKey, encryptFile, decryptFile } from './crypto';

const VAULT_DIR = FileSystem.documentDirectory + 'vault/';

export const ensureVaultDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
};

export const saveFile = async (name, data) => {
  await ensureVaultDirectory();
  const key = await generateKey();
  const encrypted = await encryptFile(data, key);
  const fileId = Date.now().toString();
  const filePath = `${VAULT_DIR}${fileId}.enc`;

  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(encrypted));

  return {
    id: fileId,
    name,
    size: data.length,
    encryptedPath: filePath,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };
};

export const getFile = async (id) => {
  const filePath = `${VAULT_DIR}${id}.enc`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);

  if (!fileInfo.exists) {
    throw new Error('File not found');
  }

  const encryptedData = await FileSystem.readAsStringAsync(filePath);
  const encrypted = JSON.parse(encryptedData);
  const key = await generateKey(); // In a real app, you would store/retrieve the key securely
  const decrypted = await decryptFile(encrypted, key);

  return {
    id,
    name: fileInfo.name,
    size: fileInfo.size,
    data: decrypted,
  };
};

export const deleteFile = async (id) => {
  const filePath = `${VAULT_DIR}${id}.enc`;
  await FileSystem.deleteAsync(filePath, { idempotent: true });
};
