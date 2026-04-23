import * as FileSystem from 'expo-file-system';

const MEDIA_DIR = `${FileSystem.documentDirectory}media/`;
const THUMBNAIL_DIR = `${MEDIA_DIR}thumbnails/`;

export async function initStorage() {
  try {
    // Create necessary directories
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${MEDIA_DIR}videos/`, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${MEDIA_DIR}images/`, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${MEDIA_DIR}articles/`, { intermediates: true });
    await FileSystem.makeDirectoryAsync(THUMBNAIL_DIR, { intermediates: true });
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

export async function saveFile(
  filename: string,
  data: string | Uint8Array,
  type: 'video' | 'image' | 'article' | 'thumbnail'
): Promise<string> {
  try {
    let dir = MEDIA_DIR;
    switch (type) {
      case 'video':
        dir += 'videos/';
        break;
      case 'image':
        dir += 'images/';
        break;
      case 'article':
        dir += 'articles/';
        break;
      case 'thumbnail':
        dir = THUMBNAIL_DIR;
        break;
    }

    const fileUri = `${dir}${filename}`;

    if (typeof data === 'string') {
      await FileSystem.writeAsStringAsync(fileUri, data);
    } else {
      await FileSystem.writeAsStringAsync(fileUri, data.toString());
    }

    return fileUri;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

export async function deleteFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileUri(filename: string, type: 'video' | 'image' | 'article' | 'thumbnail'): Promise<string | null> {
  try {
    let dir = MEDIA_DIR;
    switch (type) {
      case 'video':
        dir += 'videos/';
        break;
      case 'image':
        dir += 'images/';
        break;
      case 'article':
        dir += 'articles/';
        break;
      case 'thumbnail':
        dir = THUMBNAIL_DIR;
        break;
    }

    const fileUri = `${dir}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      return fileUri;
    }

    return null;
  } catch (error) {
    console.error('Error getting file URI:', error);
    return null;
  }
}
