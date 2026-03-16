import * as FileSystem from 'expo-file-system';
import { getMediaFromDropbox } from './dropboxService';
import { getMediaFromGoogleDrive } from './googleDriveService';
import { getMediaFromiCloud } from './icloudService';
import { insertMedia, getMediaBySource } from '../database/queries';
import { computeImageHash } from '../utils/imageHash';

export const syncCloudService = async (service, token) => {
  let media = [];
  switch (service) {
    case 'dropbox':
      media = await getMediaFromDropbox(token);
      break;
    case 'google':
      media = await getMediaFromGoogleDrive(token);
      break;
    case 'icloud':
      media = await getMediaFromiCloud(token);
      break;
    default:
      throw new Error('Unsupported cloud service');
  }

  const localMedia = await getMediaBySource(service);
  const newMedia = media.filter((item) => !localMedia.some((localItem) => localItem.cloudId === item.id));

  let synced = 0;
  let errors = 0;

  for (const item of newMedia) {
    try {
      const fileUri = `${FileSystem.documentDirectory}${item.name}`;
      await FileSystem.downloadAsync(item.path, fileUri);
      const hash = await computeImageHash(fileUri);
      await insertMedia({
        cloudId: item.id,
        source: service,
        localPath: fileUri,
        hash,
        syncedAt: Date.now(),
      });
      synced++;
    } catch (error) {
      errors++;
    }
  }

  return { synced, errors };
};
