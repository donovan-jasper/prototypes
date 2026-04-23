import * as FileSystem from 'expo-file-system';
import { getAllManga, updateMangaProgress } from './db';
import { Manga } from '../types';

const SYNC_FILE_NAME = 'pageturn_sync.json';
const SYNC_DIRECTORY = FileSystem.documentDirectory + 'sync/';

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

export async function uploadSyncData(): Promise<{ success: boolean; error?: string }> {
  try {
    // Prepare sync data
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

    // Save to local file
    const fileUri = SYNC_DIRECTORY + SYNC_FILE_NAME;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(syncData));

    // In a real implementation, this would upload to iCloud/Google Drive
    // For this prototype, we'll just simulate the upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function downloadSyncData(): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would download from iCloud/Google Drive
    // For this prototype, we'll just read from the local file
    const fileUri = SYNC_DIRECTORY + SYNC_FILE_NAME;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return { success: false, error: 'No sync data found' };
    }

    const syncData: SyncData = JSON.parse(await FileSystem.readAsStringAsync(fileUri));

    // Update local database with synced progress
    for (const mangaId in syncData.mangaProgress) {
      const progress = syncData.mangaProgress[mangaId];
      await updateMangaProgress(mangaId, progress.currentPage, progress.lastRead);
    }

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
