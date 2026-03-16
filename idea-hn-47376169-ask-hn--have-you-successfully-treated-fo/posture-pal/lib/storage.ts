import * as FileSystem from 'expo-file-system';

export const savePhoto = async (uri: string): Promise<string> => {
  const fileName = `posture-photo-${Date.now()}.jpg`;
  const newUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: newUri });
  return newUri;
};

export const deletePhoto = async (uri: string): Promise<void> => {
  await FileSystem.deleteAsync(uri);
};

export const getPhotos = async (): Promise<string[]> => {
  const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  return files
    .filter((file) => file.startsWith('posture-photo-'))
    .map((file) => `${FileSystem.documentDirectory}${file}`);
};
