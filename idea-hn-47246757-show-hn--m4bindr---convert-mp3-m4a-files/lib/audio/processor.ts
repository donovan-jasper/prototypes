import { Audio } from 'expo-av';

export const mergeAudioFiles = async (filePaths: string[]) => {
  return filePaths[0];
};

export const embedChapters = async (audioPath: string, chapters: any[]) => {
  return audioPath;
};

export const extractAudioDuration = async (fileUri: string): Promise<number> => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: false }
    );
    
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    
    if (status.isLoaded && status.durationMillis) {
      return status.durationMillis;
    }
    
    return 0;
  } catch (error) {
    console.error('Error extracting audio duration:', error);
    return 0;
  }
};

export const extractMultipleFileDurations = async (fileUris: string[]): Promise<number[]> => {
  const durations = await Promise.all(
    fileUris.map(uri => extractAudioDuration(uri))
  );
  return durations;
};

export const calculateTotalDuration = (durations: number[]): number => {
  return durations.reduce((total, duration) => total + duration, 0);
};
