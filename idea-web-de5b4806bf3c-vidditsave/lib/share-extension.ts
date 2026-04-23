import { Platform, Linking, ToastAndroid, Alert } from 'react-native';
import { parseUrl } from './parser';
import { downloadMedia } from './downloader';
import { addItem } from './db';
import * as Notifications from 'expo-notifications';
import { useStore } from '@/store/useStore';

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
  onProgress?: (message: string, progress?: { current: number; total: number }) => void
): Promise<{ success: boolean; itemId?: number; error?: string }> {
  try {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    onProgress?.('Analyzing URL...');
    const parsed = parseUrl(url);

    if (!parsed) {
      throw new Error('Could not parse URL');
    }

    onProgress?.('Downloading content...');
    const result = await downloadMedia(url, (current, total) => {
      const percent = Math.round((current / total) * 100);
      onProgress?.(`Downloading... ${percent}%`, { current, total });
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

    // Update store
    const { addItem: addToStore } = useStore.getState();
    addToStore({
      id: itemId,
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

    // Show success notification
    await showSuccessNotification(result.title);

    return { success: true, itemId };
  } catch (error) {
    console.error('Error processing shared URL:', error);

    // Show error notification
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        error instanceof Error ? error.message : 'Failed to save content',
        ToastAndroid.LONG
      );
    } else {
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save content'
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save content',
    };
  }
}

export async function showSuccessNotification(title: string) {
  try {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Saved: ${title}`, ToastAndroid.SHORT);
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SaveStack',
          body: `Saved: ${title}`,
          sound: true,
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
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
