import * as MediaLibrary from 'expo-media-library';

export const saveToCameraRoll = async (localPath) => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library denied');
  }

  await MediaLibrary.saveToLibraryAsync(localPath);
};
