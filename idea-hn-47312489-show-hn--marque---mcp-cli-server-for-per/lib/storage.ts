import * as FileSystem from 'expo-file-system';

const IMAGE_DIR = `${FileSystem.documentDirectory}images/`;

export const saveImage = async (uri) => {
  const filename = uri.split('/').pop();
  const dest = `${IMAGE_DIR}${filename}`;

  await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  await FileSystem.copyAsync({ from: uri, to: dest });

  return dest;
};

export const deleteImage = async (uri) => {
  await FileSystem.deleteAsync(uri);
};
