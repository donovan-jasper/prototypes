import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { getAllManga, updateMangaProgress } from './db';
import { Manga } from '../types';

const SYNC_FILE_NAME = 'pageturn_sync.json';
const SYNC_DIRECTORY = FileSystem.documentDirectory + 'sync/';
const PREMIUM_KEY = 'premium_status';

interface SyncData {
  lastSync: number;
  mangaProgress: {
    [id: string]: {
      currentPage: number;
      lastRead: number;
    };
  };
}

export async function initializeSyncDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(SYNC_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SYNC_DIRECTORY, { intermediates: true });
  }
}

export async function isPremiumUser(): Promise<boolean> {
  try {
    const premiumStatus = await SecureStore.getItemAsync(PREMIUM_KEY);
    return premiumStatus === 'true';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

export async function exportProgressToJson(): Promise<string> {
  if (!(await isPremiumUser())) {
    throw new Error('Cloud sync requires premium membership');
  }

  const mangaList = await getAllManga();
  const syncData: SyncData = {
    lastSync: Date.now(),
    mangaProgress: {},
  };

  mangaList.forEach(manga => {
    syncData.mangaProgress[manga.id] = {
      currentPage: manga.currentPage,
      lastRead: manga.lastRead,
    };
  });

  return JSON.stringify(syncData);
}

export async function importProgressFromJson(jsonString: string): Promise<void> {
  if (!(await isPremiumUser())) {
    throw new Error('Cloud sync requires premium membership');
  }

  try {
    const syncData: SyncData = JSON.parse(jsonString);

    for (const mangaId in syncData.mangaProgress) {
      const progress = syncData.mangaProgress[mangaId];
      await updateMangaProgress(mangaId, progress.currentPage, progress.lastRead);
    }
  } catch (error) {
    throw new Error('Failed to import progress data');
  }
}

export async function uploadSyncData(): Promise<{ success: boolean; error?: string }> {
  if (!(await isPremiumUser())) {
    return { success: false, error: 'Cloud sync requires premium membership' };
  }

  try {
    const syncData = await exportProgressToJson();
    const fileUri = SYNC_DIRECTORY + SYNC_FILE_NAME;
    await FileSystem.writeAsStringAsync(fileUri, syncData);

    // Simulate cloud upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function downloadSyncData(): Promise<{ success: boolean; error?: string }> {
  if (!(await isPremiumUser())) {
    return { success: false, error: 'Cloud sync requires premium membership' };
  }

  try {
    const fileUri = SYNC_DIRECTORY + SYNC_FILE_NAME;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return { success: false, error: 'No sync data found' };
    }

    const syncData = await FileSystem.readAsStringAsync(fileUri);
    await importProgressFromJson(syncData);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getLastSyncTime(): Promise<number | null> {
  try {
    const fileUri = SYNC_DIRECTORY + SYNC_FILE_NAME;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return null;
    }

    const syncData: SyncData = JSON.parse(await FileSystem.readAsStringAsync(fileUri));
    return syncData.lastSync;
  } catch {
    return null;
  }
}
