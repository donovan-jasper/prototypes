import { getFollowedArtists, addAlbum, getAlbumsByArtist, Album } from './database';
import { scheduleNewReleaseNotification, scheduleHighScoreNotification } from './notifications';
import { fetchArtistAlbums } from './api';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_SYNC_TASK = 'background-sync';

export interface SyncResult {
  newAlbums: Album[];
  errors: string[];
}

export const syncNewReleases = async (): Promise<SyncResult> => {
  const followedArtists = await getFollowedArtists();
  const newAlbums: Album[] = [];
  const errors: string[] = [];

  for (const artist of followedArtists) {
    try {
      const remoteAlbums = await fetchArtistAlbums(artist.id);
      const localAlbums = await getAlbumsByArtist(artist.id);
      const localAlbumIds = new Set(localAlbums.map((a) => a.id));

      for (const album of remoteAlbums) {
        if (!localAlbumIds.has(album.id)) {
          await addAlbum(album);
          newAlbums.push(album);

          await scheduleNewReleaseNotification(album, artist.name);
          await scheduleHighScoreNotification(album, artist.name);
        }
      }
    } catch (error) {
      errors.push(`Failed to sync ${artist.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { newAlbums, errors };
};

export const checkForNewReleases = async (): Promise<number> => {
  const result = await syncNewReleases();
  return result.newAlbums.length;
};

// Background sync setup
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const newAlbumCount = await checkForNewReleases();
    return newAlbumCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundSync = async (): Promise<void> => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 6 * 60 * 60, // 6 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
};

export const unregisterBackgroundSync = async (): Promise<void> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
  }
};
