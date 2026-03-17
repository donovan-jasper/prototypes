import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/constants/Config';

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
    // Create destination directory if it doesn't exist
    await FileSystem.makeDirectoryAsync(destination, { intermediates: true });

    // Get the filename from the URI
    const filename = uri.split('/').pop();
    if (!filename) {
      throw new Error('Invalid file URI');
    }

    // Move the file
    await FileSystem.moveAsync({
      from: uri,
      to: `${destination}/${filename}`,
    });
  }

  async deleteFile(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri);
  }

  getOrganizedFolder(): string {
    return `${FileSystem.documentDirectory}${CONFIG.STORAGE.ORGANIZED_FOLDER}`;
  }

  private async categorizePhoto(uri: string): Promise<string> {
    // In a real implementation, this would use the ImageClassifier
    // For now, we'll use a simple heuristic based on filename
    const filename = uri.toLowerCase();

    if (filename.includes('receipt') || filename.includes('invoice')) {
      return 'Receipts';
    } else if (filename.includes('screenshot')) {
      return 'Screenshots';
    } else if (filename.includes('profile') || filename.includes('selfie')) {
      return 'People';
    } else if (filename.includes('food') || filename.includes('meal')) {
      return 'Food';
    } else {
      return 'General';
    }
  }

  private async categorizeDocument(uri: string): Promise<string> {
    // In a real implementation, this would analyze the document content
    // For now, we'll use a simple heuristic based on filename and extension
    const filename = uri.toLowerCase();

    if (filename.includes('receipt') || filename.includes('invoice')) {
      return 'Receipts';
    } else if (filename.includes('contract') || filename.includes('agreement')) {
      return 'Contracts';
    } else if (filename.includes('resume') || filename.includes('cv')) {
      return 'Resumes';
    } else {
      return 'Documents';
    }
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
