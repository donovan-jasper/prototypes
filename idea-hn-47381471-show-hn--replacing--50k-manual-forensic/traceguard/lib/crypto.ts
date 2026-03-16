import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';

export const hashDocument = async (uri: string) => {
  const fileContent = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const hash = CryptoJS.SHA256(fileContent).toString(CryptoJS.enc.Hex);
  return hash;
};
