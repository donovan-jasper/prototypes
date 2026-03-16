import { useState, useEffect } from 'react';
import { generateKey, encryptFile, decryptFile } from '@/lib/crypto';

export const useEncryption = () => {
  const [key, setKey] = useState(null);

  useEffect(() => {
    const initializeKey = async () => {
      const newKey = await generateKey();
      setKey(newKey);
    };

    initializeKey();
  }, []);

  const encrypt = async (data) => {
    if (!key) throw new Error('Encryption key not initialized');
    return encryptFile(data, key);
  };

  const decrypt = async (encryptedData) => {
    if (!key) throw new Error('Encryption key not initialized');
    return decryptFile(encryptedData, key);
  };

  return {
    encrypt,
    decrypt,
  };
};
