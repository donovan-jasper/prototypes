import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('critwave.db');

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  followedAt: number;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  coverUrl: string;
  releaseDate: string;
  consensusScore: number;
}

export interface Rating {
  id: string;
  albumId: string;
  userId: string;
  rating: number;
  notes: string;
  createdAt: number;
}

export interface AlbumWithRating extends Album {
  rating: number;
  notes: string;
}

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS artists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        imageUrl TEXT,
        followedAt INTEGER NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artistId TEXT NOT NULL,
        coverUrl TEXT,
        releaseDate TEXT,
        consensusScore INTEGER DEFAULT 0,
        FOREIGN KEY (artistId) REFERENCES artists(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        albumId TEXT NOT NULL,
        userId TEXT NOT NULL,
        rating INTEGER NOT NULL,
        notes TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums(id),
        UNIQUE(albumId, userId)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        albumId TEXT NOT NULL,
        publication TEXT NOT NULL,
        score INTEGER NOT NULL,
        reviewUrl TEXT,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums(id)
      );
    `);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getFollowedArtists = async (): Promise<Artist[]> => {
  try {
    const result = await db.getAllAsync<Artist>('SELECT * FROM artists ORDER BY followedAt DESC');
    return result;
  } catch (error) {
    console.error('Failed to get followed artists:', error);
    throw error;
  }
};

export const addArtist = async (artist: Artist): Promise<void> => {
  try {
    await db.runAsync(
      'INSERT INTO artists (id, name, imageUrl, followedAt) VALUES (?, ?, ?, ?)',
      [artist.id, artist.name, artist.imageUrl, artist.followedAt]
    );
  } catch (error) {
    console.error('Failed to add artist:', error);
    throw error;
  }
};

export const removeArtist = async (artistId: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM artists WHERE id = ?', [artistId]);
  } catch (error) {
    console.error('Failed to remove artist:', error);
    throw error;
  }
};

export const getArtistById = async (artistId: string): Promise<Artist | null> => {
  try {
    const result = await db.getFirstAsync<Artist>('SELECT * FROM artists WHERE id = ?', [artistId]);
    return result || null;
  } catch (error) {
    console.error('Failed to get artist by ID:', error);
    throw error;
  }
};

export const rateAlbum = async (rating: Omit<Rating, 'id'>): Promise<void> => {
  try {
    const id = `${rating.albumId}-${rating.userId}-${Date.now()}`;
    await db.runAsync(
      'INSERT OR REPLACE INTO ratings (id, albumId, userId, rating, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, rating.albumId, rating.userId, rating.rating, rating.notes, rating.createdAt]
    );
  } catch (error) {
    console.error('Failed to rate album:', error);
    throw error;
  }
};

export const getUserRatings = async (userId: string): Promise<AlbumWithRating[]> => {
  try {
    const result = await db.getAllAsync<AlbumWithRating>(
      `SELECT albums.*, ratings.rating, ratings.notes
       FROM ratings
       JOIN albums ON ratings.albumId = albums.id
       WHERE ratings.userId = ?
       ORDER BY ratings.createdAt DESC`,
      [userId]
    );
    return result;
  } catch (error) {
    console.error('Failed to get user ratings:', error);
    throw error;
  }
};

export const getRatingForAlbum = async (albumId: string, userId: string): Promise<Rating | null> => {
  try {
    const result = await db.getFirstAsync<Rating>(
      'SELECT * FROM ratings WHERE albumId = ? AND userId = ?',
      [albumId, userId]
    );
    return result || null;
  } catch (error) {
    console.error('Failed to get rating for album:', error);
    throw error;
  }
};

export const addAlbum = async (album: Album): Promise<void> => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO albums (id, title, artistId, coverUrl, releaseDate, consensusScore) VALUES (?, ?, ?, ?, ?, ?)',
      [album.id, album.title, album.artistId, album.coverUrl, album.releaseDate, album.consensusScore]
    );
  } catch (error) {
    console.error('Failed to add album:', error);
    throw error;
  }
};

export const getAlbumById = async (albumId: string): Promise<Album | null> => {
  try {
    const result = await db.getFirstAsync<Album>('SELECT * FROM albums WHERE id = ?', [albumId]);
    return result || null;
  } catch (error) {
    console.error('Failed to get album by ID:', error);
    throw error;
  }
};

export const getAlbumsByArtist = async (artistId: string): Promise<Album[]> => {
  try {
    const result = await db.getAllAsync<Album>(
      'SELECT * FROM albums WHERE artistId = ? ORDER BY releaseDate DESC',
      [artistId]
    );
    return result;
  } catch (error) {
    console.error('Failed to get albums by artist:', error);
    throw error;
  }
};
