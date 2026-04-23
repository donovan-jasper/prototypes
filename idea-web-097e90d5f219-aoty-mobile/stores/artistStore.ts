import { create } from 'zustand';
import { getFollowedArtists, addArtist, removeArtist, Artist } from '@/services/database';

interface ArtistStore {
  followedArtists: Artist[];
  loadFollowedArtists: () => Promise<void>;
  followArtist: (artist: Artist) => Promise<void>;
  unfollowArtist: (artistId: string) => Promise<void>;
}

export const useArtistStore = create<ArtistStore>((set) => ({
  followedArtists: [],

  loadFollowedArtists: async () => {
    try {
      const artists = await getFollowedArtists();
      set({ followedArtists: artists });
    } catch (error) {
      console.error('Failed to load followed artists:', error);
      set({ followedArtists: [] });
    }
  },

  followArtist: async (artist) => {
    try {
      await addArtist({ ...artist, followedAt: Date.now() });
      set((state) => ({
        followedArtists: [artist, ...state.followedArtists]
      }));
    } catch (error) {
      console.error('Failed to follow artist:', error);
      throw error;
    }
  },

  unfollowArtist: async (artistId) => {
    try {
      await removeArtist(artistId);
      set((state) => ({
        followedArtists: state.followedArtists.filter(a => a.id !== artistId)
      }));
    } catch (error) {
      console.error('Failed to unfollow artist:', error);
      throw error;
    }
  },
}));
