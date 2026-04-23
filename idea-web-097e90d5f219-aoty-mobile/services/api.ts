import axios from 'axios';
import { Artist, Album } from './database';

const MUSICBRAINZ_API_BASE = 'https://musicbrainz.org/ws/2';
const COVERART_API_BASE = 'https://coverartarchive.org/release-group';

interface MusicBrainzArtist {
  id: string;
  name: string;
  'sort-name': string;
  disambiguation: string;
  'life-span': {
    begin: string;
    end: string | null;
  };
}

interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  'first-release-date': string;
  'primary-type': string;
}

interface CoverArtResponse {
  images: Array<{
    image: string;
    types: string[];
  }>;
}

export interface SearchArtistResult extends Artist {}

export const searchArtists = async (query: string): Promise<SearchArtistResult[]> => {
  try {
    const response = await axios.get(`${MUSICBRAINZ_API_BASE}/artist`, {
      params: {
        query: query,
        fmt: 'json',
        limit: 10
      },
      headers: {
        'User-Agent': 'CritWave/1.0 (https://github.com/yourusername/critwave)'
      }
    });

    const artists: SearchArtistResult[] = response.data.artists.map((artist: MusicBrainzArtist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: null, // Will be fetched separately
      followedAt: 0
    }));

    // Fetch images for each artist
    const artistsWithImages = await Promise.all(
      artists.map(async (artist) => {
        try {
          const imageResponse = await axios.get(`${MUSICBRAINZ_API_BASE}/artist/${artist.id}`, {
            params: {
              inc: 'url-rels',
              fmt: 'json'
            },
            headers: {
              'User-Agent': 'CritWave/1.0 (https://github.com/yourusername/critwave)'
            }
          });

          const imageUrl = imageResponse.data.relations?.find(
            (rel: any) => rel.type === 'image'
          )?.url?.resource;

          return {
            ...artist,
            imageUrl: imageUrl || null
          };
        } catch (error) {
          console.error(`Failed to fetch image for artist ${artist.id}:`, error);
          return artist;
        }
      })
    );

    return artistsWithImages;
  } catch (error) {
    console.error('Failed to search artists:', error);
    throw error;
  }
};

export const fetchArtistAlbums = async (artistId: string): Promise<Album[]> => {
  try {
    // First get release groups (albums)
    const releaseGroupsResponse = await axios.get(`${MUSICBRAINZ_API_BASE}/release-group`, {
      params: {
        artist: artistId,
        type: 'album',
        fmt: 'json',
        limit: 20
      },
      headers: {
        'User-Agent': 'CritWave/1.0 (https://github.com/yourusername/critwave)'
      }
    });

    const albums: Album[] = await Promise.all(
      releaseGroupsResponse.data['release-groups'].map(async (group: MusicBrainzReleaseGroup) => {
        let coverUrl = null;

        try {
          // Try to get cover art
          const coverResponse = await axios.get(`${COVERART_API_BASE}/${group.id}`);
          if (coverResponse.data.images && coverResponse.data.images.length > 0) {
            coverUrl = coverResponse.data.images[0].image;
          }
        } catch (error) {
          console.log(`No cover art found for release group ${group.id}`);
        }

        // Mock consensus score for demo
        const mockScore = Math.floor(Math.random() * 30) + 70;

        return {
          id: group.id,
          title: group.title,
          artistId: artistId,
          coverUrl: coverUrl,
          releaseDate: group['first-release-date'],
          consensusScore: mockScore
        };
      })
    );

    return albums;
  } catch (error) {
    console.error('Failed to fetch artist albums:', error);
    throw error;
  }
};
