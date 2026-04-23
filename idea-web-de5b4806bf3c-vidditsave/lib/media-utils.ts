import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';

export async function createThumbnail(videoUri: string): Promise<string> {
  try {
    // Create a temporary directory for thumbnails
    const thumbnailDir = `${FileSystem.documentDirectory}media/thumbnails/`;
    await FileSystem.makeDirectoryAsync(thumbnailDir, { intermediates: true });

    // Generate a unique filename
    const thumbnailFilename = `${Date.now()}_thumb.jpg`;
    const thumbnailUri = `${thumbnailDir}${thumbnailFilename}`;

    // Use expo-av to generate thumbnail
    const { uri } = await Video.getThumbnailAsync(videoUri, {
      time: 1000, // 1 second into the video
      quality: 0.5, // Medium quality
    });

    // Move the thumbnail to our permanent location
    await FileSystem.moveAsync({
      from: uri,
      to: thumbnailUri,
    });

    return thumbnailUri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}
