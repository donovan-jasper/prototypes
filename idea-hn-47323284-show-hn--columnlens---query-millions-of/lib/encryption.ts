import * as Crypto from 'expo-crypto';

const ALGORITHM = 'AES-CBC';
const IV_LENGTH = 16;

export const encrypt = async (data, key) => {
  const iv = Crypto.getRandomBytes(IV_LENGTH);
  const cipher = await Crypto.createCipher(ALGORITHM, key, iv);
  const encrypted = await cipher.update(data, 'utf8', 'base64');
  return iv.toString('base64') + encrypted + (await cipher.final('base64'));
};

export const decrypt = async (encryptedData, key) => {
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'base64');
  const encrypted = encryptedData.slice(IV_LENGTH * 2);
  const decipher = await Crypto.createDecipher(ALGORITHM, key, iv);
  const decrypted = await decipher.update(encrypted, 'base64', 'utf8');
  return decrypted + (await decipher.final('utf8'));
};
