import * as SQLite from 'expo-sqlite';
import { Artist, ArtistWork, Tip } from '../types';

const db = SQLite.openDatabase('credigen.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS artists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          style TEXT NOT NULL,
          bio TEXT NOT NULL,
          profileImage TEXT NOT NULL,
          followers INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS artist_works (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          artistId INTEGER NOT NULL,
          imageUrl TEXT NOT NULL,
          description TEXT,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (artistId) REFERENCES artists (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          artistId INTEGER NOT NULL,
          amount REAL NOT NULL,
          fee REAL NOT NULL,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (artistId) REFERENCES artists (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS generations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prompt TEXT NOT NULL,
          imageUri TEXT NOT NULL,
          attribution TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          ethicalScore INTEGER NOT NULL
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          premiumStatus INTEGER DEFAULT 0,
          generationCount INTEGER DEFAULT 0,
          totalScore INTEGER DEFAULT 0,
          balance REAL DEFAULT 0
        );`
      );

      // Create indexes for better performance
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_artists_style ON artists(style);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_artist_works_artistId ON artist_works(artistId);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_tips_artistId ON tips(artistId);');
      tx.executeSql('CREATE INDEX IF NOT EXISTS idx_generations_timestamp ON generations(timestamp);');
    }, reject, resolve);
  });
};

export const saveArtist = async (artist: Omit<Artist, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO artists (name, style, bio, profileImage, followers, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
        [artist.name, artist.style, artist.bio, artist.profileImage, artist.followers, artist.createdAt],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getArtists = async (): Promise<Artist[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM artists ORDER BY followers DESC;',
        [],
        (_, { rows }) => resolve(rows._array as Artist[]),
        (_, error) => reject(error)
      );
    });
  });
};

export const getArtistWorks = async (artistId: number): Promise<ArtistWork[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM artist_works WHERE artistId = ? ORDER BY createdAt DESC;',
        [artistId],
        (_, { rows }) => resolve(rows._array as ArtistWork[]),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveTip = async (tip: Omit<Tip, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tips (artistId, amount, fee, timestamp) VALUES (?, ?, ?, ?);',
        [tip.artistId, tip.amount, tip.fee, tip.timestamp],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getArtistEarnings = async (artistId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT SUM(amount) as total FROM tips WHERE artistId = ?;',
        [artistId],
        (_, { rows }) => {
          const total = rows._array[0].total || 0;
          resolve(total);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// New function to add a work to an artist's portfolio
export const addArtistWork = async (work: Omit<ArtistWork, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO artist_works (artistId, imageUrl, description, createdAt) VALUES (?, ?, ?, ?);',
        [work.artistId, work.imageUrl, work.description || '', work.createdAt],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

// New function to increment artist followers
export const incrementArtistFollowers = async (artistId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE artists SET followers = followers + 1 WHERE id = ?;',
        [artistId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
