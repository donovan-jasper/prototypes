import * as FileSystem from 'expo-file-system';

export const deleteFile = async (localPath) => {
  await FileSystem.deleteAsync(localPath);
};

export const getFileInfo = async (localPath) => {
  return await FileSystem.getInfoAsync(localPath);
};
