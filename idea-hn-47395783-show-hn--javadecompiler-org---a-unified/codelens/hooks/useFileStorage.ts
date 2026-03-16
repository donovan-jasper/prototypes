import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

export const useFileStorage = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadFiles = async () => {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      setFiles(files);
    };
    loadFiles();
  }, []);

  const saveFile = async (fileName, content) => {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, content);
    setFiles([...files, fileName]);
  };

  const getFile = async (fileName) => {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    const content = await FileSystem.readAsStringAsync(fileUri);
    return content;
  };

  const deleteFile = async (fileName) => {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.deleteAsync(fileUri);
    setFiles(files.filter((file) => file !== fileName));
  };

  return {
    files,
    saveFile,
    getFile,
    deleteFile,
  };
};
