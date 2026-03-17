import { useState, useEffect } from 'react';
import { initDatabase, getFiles, deleteFile, addFile } from '@/lib/database';
import { saveFile, getFile, deleteFile as deleteStoredFile } from '@/lib/storage';
import { generateShareLink, validateShareLink, isLinkExpired, incrementDownloadCount } from '@/lib/sharing';
import { useEncryption } from './useEncryption';

export const useFileVault = () => {
  const [files, setFiles] = useState([]);
  const { encrypt, decrypt } = useEncryption();

  useEffect(() => {
    initDatabase();
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    const storedFiles = await getFiles();
    setFiles(storedFiles);
  };

  const addNewFile = async (name, data) => {
    const encryptedData = await encrypt(data);
    const file = await saveFile(name, JSON.stringify(encryptedData));
    await addFile(file);
    await refreshFiles();
    return file;
  };

  const removeFile = async (id) => {
    await deleteFile(id);
    await deleteStoredFile(id);
    await refreshFiles();
  };

  const shareFile = async (file, expirationHours) => {
    // In a real app, you would encrypt the file and store it securely
    // For this example, we'll just generate a share link
    return generateShareLink(file.id, expirationHours);
  };

  const validateLink = async (linkId) => {
    const { linkId: id, expiresAt } = validateShareLink(linkId);

    if (isLinkExpired(expiresAt)) {
      throw new Error('This share link has expired');
    }

    // In a real app, you would fetch file info from the share
    // For this example, we'll return mock data
    return {
      name: 'Shared File',
      size: 1024,
      expiresIn: Math.ceil((expiresAt - Date.now()) / (60 * 60 * 1000)),
    };
  };

  const receiveFile = async (linkId) => {
    const { linkId: id } = validateShareLink(linkId);
    const share = await incrementDownloadCount(id);

    // In a real app, you would fetch the actual file data
    // For this example, we'll create a mock file
    const mockData = 'This is the received file content';
    await addNewFile('Received File', mockData);
  };

  const getFile = async (id) => {
    const fileInfo = await getFile(id);
    const decryptedData = await decrypt(JSON.parse(fileInfo.data));
    return {
      ...fileInfo,
      data: decryptedData
    };
  };

  return {
    files,
    refreshFiles,
    addNewFile,
    removeFile,
    shareFile,
    validateLink,
    receiveFile,
    getFile,
  };
};
