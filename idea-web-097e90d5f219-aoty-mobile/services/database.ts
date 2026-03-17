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

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      imageUrl TEXT,
      followedAt INTEGER NOT NULL
    );
  `);

  db.execSync(`
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

  db.execSync(`
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

  db.execSync(`
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
};

export const getFollowedArtists = (): Artist[] => {
  const result = db.getAllSync<Artist>('SELECT * FROM artists ORDER BY followedAt DESC');
  return result;
};

export const addArtist = (artist: Artist): void => {
  db.runSync(
    'INSERT INTO artists (id, name, imageUrl, followedAt) VALUES (?, ?, ?, ?)',
    [artist.id, artist.name, artist.imageUrl, artist.followedAt]
  );
};

export const removeArtist = (artistId: string): void => {
  db.runSync('DELETE FROM artists WHERE id = ?', [artistId]);
};

export const getArtistById = (artistId: string): Artist | null => {
  const result = db.getFirstSync<Artist>('SELECT * FROM artists WHERE id = ?', [artistId]);
  return result || null;
};

export const rateAlbum = (rating: Omit<Rating, 'id'>): void => {
  const id = `${rating.albumId}-${rating.userId}-${Date.now()}`;
  db.runSync(
    'INSERT OR REPLACE INTO ratings (id, albumId, userId, rating, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, rating.albumId, rating.userId, rating.rating, rating.notes, rating.createdAt]
  );
};

export const getUserRatings = (userId: string): AlbumWithRating[] => {
  const result = db.getAllSync<AlbumWithRating>(
    `SELECT albums.*, ratings.rating, ratings.notes 
     FROM ratings 
     JOIN albums ON ratings.albumId = albums.id 
     WHERE ratings.userId = ?
     ORDER BY ratings.createdAt DESC`,
    [userId]
  );
  return result;
};

export const getRatingForAlbum = (albumId: string, userId: string): Rating | null => {
  const result = db.getFirstSync<Rating>(
    'SELECT * FROM ratings WHERE albumId = ? AND userId = ?',
    [albumId, userId]
  );
  return result || null;
};

export const addAlbum = (album: Album): void => {
  db.runSync(
    'INSERT OR REPLACE INTO albums (id, title, artistId, coverUrl, releaseDate, consensusScore) VALUES (?, ?, ?, ?, ?, ?)',
    [album.id, album.title, album.artistId, album.coverUrl, album.releaseDate, album.consensusScore]
  );
};

export const getAlbumById = (albumId: string): Album | null => {
  const result = db.getFirstSync<Album>('SELECT * FROM albums WHERE id = ?', [albumId]);
  return result || null;
};

export const getAlbumsByArtist = (artistId: string): Album[] => {
  const result = db.getAllSync<Album>(
    'SELECT * FROM albums WHERE artistId = ? ORDER BY releaseDate DESC',
    [artistId]
  );
  return result;
};

export const getAllAlbums = (): Album[] => {
  const result = db.getAllSync<Album>('SELECT * FROM albums ORDER BY consensusScore DESC');
  return result;
};
