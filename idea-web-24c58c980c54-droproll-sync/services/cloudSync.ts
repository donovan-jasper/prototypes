import { getMediaFromDropbox, getMediaFromGoogleDrive, getMediaFromiCloud } from './cloudServiceWrappers';
import { insertMedia, getMediaBySource, updateMediaHash } from '../database/queries';
import * as FileSystem from 'expo-file-system';
import { computeAndStoreHashes } from './duplicateDetector';
import { useSyncStore } from '../store/syncStore';

interface SyncResult {
  synced: number;
  errors: number;
  duplicates: number;
}

export const syncCloudService = async (service: string, token: string): Promise<SyncResult> => {
  const setSyncProgress = useSyncStore.getState().setSyncProgress;
  let synced = 0;
  let errors = 0;
  let duplicates = 0;

  try {
    // Get media from the appropriate cloud service
    let cloudMedia;
    switch (service) {
      case 'dropbox':
        cloudMedia = await getMediaFromDropbox(token);
        break;
      case 'google':
        cloudMedia = await getMediaFromGoogleDrive(token);
        break;
      case 'icloud':
        cloudMedia = await getMediaFromiCloud(token);
        break;
      default:
        throw new Error(`Unsupported cloud service: ${service}`);
    }

    // Get existing media from database for this service
    const existingMedia = await getMediaBySource(service);
    const existingIds = new Set(existingMedia.map(item => item.cloudId));

    // Filter out already synced media
    const newMedia = cloudMedia.filter(item => !existingIds.has(item.id));

    if (newMedia.length === 0) {
      return { synced: 0, errors: 0, duplicates: 0 };
    }

    // Update sync progress
    setSyncProgress({
      current: 0,
      total: newMedia.length,
      service,
      isSyncing: true
    });

    // Process each new media item
    for (let i = 0; i < newMedia.length; i++) {
      const item = newMedia[i];

      try {
        // Download the file
        const localUri = `${FileSystem.documentDirectory}${service}/${item.name}`;
        await FileSystem.downloadAsync(item.path, localUri);

        // Create media record with placeholder hash
        const mediaRecord = {
          cloudId: item.id,
          source: service,
          localPath: localUri,
          hash: '', // Will be computed and updated later
          metadata: JSON.stringify({
            name: item.name,
            modifiedTime: item.modifiedTime,
            thumbnailUrl: item.thumbnailUrl
          }),
          syncedAt: Date.now()
        };

        // Insert into database
        await insertMedia(mediaRecord);

        // Update progress
        setSyncProgress({
          current: i + 1,
          total: newMedia.length,
          service,
          isSyncing: true
        });

        synced++;
      } catch (error) {
        console.error(`Error syncing ${item.name}:`, error);
        errors++;
      }
    }

    // After all files are downloaded, compute and store hashes
    const allMedia = await getMediaBySource(service);
    const mediaWithHashes = await computeAndStoreHashes(allMedia);

    // Update hashes in database
    for (const item of mediaWithHashes) {
      if (item.hash) {
        await updateMediaHash(item.id, item.hash);
      }
    }

    // Now run duplicate detection
    const { findDuplicates } = require('./duplicateDetector');
    const duplicateGroups = await findDuplicates();
    duplicates = duplicateGroups.length;

  } catch (error) {
    console.error(`Error syncing ${service}:`, error);
    errors++;
  } finally {
    setSyncProgress({
      current: 0,
      total: 0,
      service: '',
      isSyncing: false
    });
  }

  return { synced, errors, duplicates };
};
