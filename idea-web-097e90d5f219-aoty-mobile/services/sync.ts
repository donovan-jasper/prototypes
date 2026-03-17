import { getFollowedArtists, addAlbum, getAlbumsByArtist, Album } from './database';
import { scheduleNewReleaseNotification, scheduleHighScoreNotification } from './notifications';
import { fetchArtistAlbums } from './api';

export interface SyncResult {
  newAlbums: Album[];
  errors: string[];
}

export const syncNewReleases = async (): Promise<SyncResult> => {
  const followedArtists = getFollowedArtists();
  const newAlbums: Album[] = [];
  const errors: string[] = [];

  for (const artist of followedArtists) {
    try {
      const remoteAlbums = await fetchArtistAlbums(artist.id);
      const localAlbums = getAlbumsByArtist(artist.id);
      const localAlbumIds = new Set(localAlbums.map((a) => a.id));

      for (const album of remoteAlbums) {
        if (!localAlbumIds.has(album.id)) {
          addAlbum(album);
          newAlbums.push(album);

          await scheduleNewReleaseNotification(album, artist.name);
          await scheduleHighScoreNotification(album, artist.name);
        }
      }
    } catch (error) {
      errors.push(`Failed to sync ${artist.name}: ${error}`);
    }
  }

  return { newAlbums, errors };
};

export const checkForNewReleases = async (): Promise<number> => {
  const result = await syncNewReleases();
  return result.newAlbums.length;
};
