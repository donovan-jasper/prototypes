import { Platform, Linking } from 'react-native';
import { parseUrl } from './parser';
import { downloadMedia } from './downloader';
import { addItem } from './db';

export interface ShareData {
  url: string;
}

export async function getSharedUrl(): Promise<string | null> {
  try {
    const initialUrl = await Linking.getInitialURL();
    
    if (!initialUrl) {
      return null;
    }

    if (Platform.OS === 'android') {
      const urlMatch = initialUrl.match(/url=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
    }

    if (Platform.OS === 'ios') {
      if (initialUrl.startsWith('http://') || initialUrl.startsWith('https://')) {
        return initialUrl;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting shared URL:', error);
    return null;
  }
}

export async function processSharedUrl(
  url: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; itemId?: number; error?: string }> {
  try {
    onProgress?.('Analyzing URL...');
    const parsed = parseUrl(url);

    onProgress?.('Downloading content...');
    const result = await downloadMedia(url, (current, total) => {
      const percent = Math.round((current / total) * 100);
      onProgress?.(`Downloading... ${percent}%`);
    });

    onProgress?.('Saving to library...');
    const itemId = await addItem({
      url,
      title: result.title,
      type: result.type,
      fileUri: result.fileUri,
      thumbnailUri: result.thumbnailUri || null,
      source: result.source,
      createdAt: Date.now(),
      collectionId: null,
      duration: result.duration,
      fileSize: result.fileSize,
    });

    return { success: true, itemId };
  } catch (error) {
    console.error('Error processing shared URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save content',
    };
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
