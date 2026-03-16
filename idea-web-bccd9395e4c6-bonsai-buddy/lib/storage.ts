import * as FileSystem from 'expo-file-system';

export const saveImage = async (uri: string, plantId: string) => {
  const filename = `${plantId}_${Date.now()}.jpg`;
  const directory = `${FileSystem.documentDirectory}plants/`;
  
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  
  const newPath = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: newPath });
  
  return newPath;
};

export const deleteImage = async (uri: string) => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const cleanupOrphanedImages = async (validUris: string[]) => {
  const directory = `${FileSystem.documentDirectory}plants/`;
  
  try {
    const files = await FileSystem.readDirectoryAsync(directory);
    
    for (const file of files) {
      const fullPath = `${directory}${file}`;
      if (!validUris.includes(fullPath)) {
        await deleteImage(fullPath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up images:', error);
  }
};
