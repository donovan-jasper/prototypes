import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { v4 as uuidv4 } from 'uuid';

export class FileManager {
  async scanPhotos(): Promise<Array<{ id: string; uri: string; type: string }>> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permissions not granted');
    }

    const albums = await MediaLibrary.getAlbumsAsync();
    const cameraRoll = albums.find(album => album.title === 'Camera');

    if (!cameraRoll) {
      return [];
    }

    const assets = await MediaLibrary.getAssetsAsync({
      album: cameraRoll,
      mediaType: 'photo',
      first: 1000,
    });

    return assets.assets.map(asset => ({
      id: asset.id,
      uri: asset.uri,
      type: asset.mediaType,
    }));
  }

  async scanDocuments(): Promise<Array<{ id: string; uri: string; type: string }>> {
    const downloadsDir = FileSystem.documentDirectory + 'downloads/';
    const files = await FileSystem.readDirectoryAsync(downloadsDir);

    return files.map(file => ({
      id: uuidv4(),
      uri: `${downloadsDir}${file}`,
      type: this.getMimeType(file),
    }));
  }

  async categorizeFiles(files: Array<{ id: string; uri: string; type: string }>): Promise<{
    photos: Array<{ id: string; uri: string; type: string; category: string }>;
    documents: Array<{ id: string; uri: string; type: string; category: string }>;
  }> {
    const categorized = {
      photos: [],
      documents: [],
    };

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Categorize photo
        const category = await this.categorizePhoto(file.uri);
        categorized.photos.push({ ...file, category });
      } else if (file.type === 'application/pdf' || file.type === 'text/plain') {
        // Categorize document
        const category = await this.categorizeDocument(file.uri);
        categorized.documents.push({ ...file, category });
      }
    }

    return categorized;
  }

  async moveFile(uri: string, destination: string): Promise<void> {
    await FileSystem.moveAsync({
      from: uri,
      to: destination,
    });
  }

  async deleteFile(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri);
  }

  private async categorizePhoto(uri: string): Promise<string> {
    // Implement photo categorization logic
    // This is a simplified version
    return 'uncategorized';
  }

  private async categorizeDocument(uri: string): Promise<string> {
    // Implement document categorization logic
    // This is a simplified version
    return 'uncategorized';
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
