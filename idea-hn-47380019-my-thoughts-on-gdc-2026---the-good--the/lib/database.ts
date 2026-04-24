import * as SQLite from 'expo-sqlite';
import { Generation, Artist, ArtistWork, Tip } from '../types';

const db = SQLite.openDatabase('credigen.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        // Generations table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS generations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            imageUri TEXT NOT NULL,
            attribution TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ethicalScore INTEGER DEFAULT 0
          )`,
          [],
          () => console.log('Generations table created successfully'),
          (_, error) => {
            console.error('Error creating generations table:', error);
            reject(error);
            return true;
          }
        );

        // User profile table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY,
            totalScore INTEGER DEFAULT 0,
            generationCount INTEGER DEFAULT 0,
            premiumStatus BOOLEAN DEFAULT 0,
            balance REAL DEFAULT 0
          )`,
          [],
          () => console.log('User profile table created'),
          (_, error) => {
            console.error('Error creating user profile table:', error);
            reject(error);
            return true;
          }
        );

        // Artists table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            style TEXT NOT NULL,
            bio TEXT,
            profileImage TEXT,
            followers INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          [],
          () => console.log('Artists table created'),
          (_, error) => {
            console.error('Error creating artists table:', error);
            reject(error);
            return true;
          }
        );

        // Artist works table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS artist_works (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artistId INTEGER NOT NULL,
            imageUrl TEXT NOT NULL,
            description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (artistId) REFERENCES artists(id)
          )`,
          [],
          () => console.log('Artist works table created'),
          (_, error) => {
            console.error('Error creating artist works table:', error);
            reject(error);
            return true;
          }
        );

        // Tips table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artistId INTEGER NOT NULL,
            amount REAL NOT NULL,
            fee REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (artistId) REFERENCES artists(id)
          )`,
          [],
          () => console.log('Tips table created'),
          (_, error) => {
            console.error('Error creating tips table:', error);
            reject(error);
            return true;
          }
        );

        // Insert default user profile if not exists
        tx.executeSql(
          `INSERT OR IGNORE INTO user_profile (id, totalScore, generationCount, premiumStatus, balance) VALUES (1, 0, 0, 0, 100)`,
          [],
          () => resolve(),
          (_, error) => {
            console.error('Error inserting default user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

// Generation functions
export const saveGeneration = async (generation: Omit<Generation, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO generations (prompt, imageUri, attribution, timestamp) VALUES (?, ?, ?, ?)`,
          [generation.prompt, generation.imageUri, JSON.stringify(generation.attribution), generation.timestamp],
          (_, result) => resolve(result.insertId!),
          (_, error) => {
            console.error('Error saving generation:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getGenerations = async (): Promise<Generation[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM generations ORDER BY timestamp DESC`,
          [],
          (_, result) => {
            const generations: Generation[] = [];

            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              generations.push({
                id: row.id,
                prompt: row.prompt,
                imageUri: row.imageUri,
                attribution: JSON.parse(row.attribution),
                timestamp: new Date(row.timestamp)
              });
            }

            resolve(generations);
          },
          (_, error) => {
            console.error('Error getting generations:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

// Artist functions
export const saveArtist = async (artist: Omit<Artist, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO artists (name, style, bio, profileImage, followers, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            artist.name,
            artist.style,
            artist.bio,
            artist.profileImage,
            artist.followers,
            artist.createdAt
          ],
          (_, result) => resolve(result.insertId!),
          (_, error) => {
            console.error('Error saving artist:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getArtists = async (): Promise<Artist[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM artists ORDER BY followers DESC`,
          [],
          (_, result) => {
            const artists: Artist[] = [];

            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              artists.push({
                id: row.id,
                name: row.name,
                style: row.style,
                bio: row.bio,
                profileImage: row.profileImage,
                followers: row.followers,
                createdAt: row.createdAt
              });
            }

            resolve(artists);
          },
          (_, error) => {
            console.error('Error getting artists:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getArtistWorks = async (artistId: number): Promise<ArtistWork[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM artist_works WHERE artistId = ? ORDER BY createdAt DESC`,
          [artistId],
          (_, result) => {
            const works: ArtistWork[] = [];

            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              works.push({
                id: row.id,
                artistId: row.artistId,
                imageUrl: row.imageUrl,
                description: row.description,
                createdAt: row.createdAt
              });
            }

            resolve(works);
          },
          (_, error) => {
            console.error('Error getting artist works:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

// Tip functions
export const saveTip = async (tip: Omit<Tip, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO tips (artistId, amount, fee, timestamp) VALUES (?, ?, ?, ?)`,
          [tip.artistId, tip.amount, tip.fee, tip.timestamp],
          (_, result) => resolve(result.insertId!),
          (_, error) => {
            console.error('Error saving tip:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getArtistEarnings = async (artistId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT SUM(amount) as total FROM tips WHERE artistId = ?`,
          [artistId],
          (_, result) => {
            const total = result.rows.item(0).total || 0;
            resolve(total);
          },
          (_, error) => {
            console.error('Error getting artist earnings:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

// User profile functions
export const getUserProfile = async (): Promise<{totalScore: number, generationCount: number, premiumStatus: boolean, balance: number}> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT totalScore, generationCount, premiumStatus, balance FROM user_profile WHERE id = 1`,
          [],
          (_, result) => {
            if (result.rows.length > 0) {
              const row = result.rows.item(0);
              resolve({
                totalScore: row.totalScore,
                generationCount: row.generationCount,
                premiumStatus: row.premiumStatus === 1,
                balance: row.balance
              });
            } else {
              resolve({
                totalScore: 0,
                generationCount: 0,
                premiumStatus: false,
                balance: 0
              });
            }
          },
          (_, error) => {
            console.error('Error getting user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const updateUserProfile = async (updates: Partial<{totalScore: number, generationCount: number, premiumStatus: boolean, balance: number}>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        const fields = [];
        const values = [];

        if (updates.totalScore !== undefined) {
          fields.push('totalScore = ?');
          values.push(updates.totalScore);
        }

        if (updates.generationCount !== undefined) {
          fields.push('generationCount = ?');
          values.push(updates.generationCount);
        }

        if (updates.premiumStatus !== undefined) {
          fields.push('premiumStatus = ?');
          values.push(updates.premiumStatus ? 1 : 0);
        }

        if (updates.balance !== undefined) {
          fields.push('balance = ?');
          values.push(updates.balance);
        }

        if (fields.length === 0) {
          resolve();
          return;
        }

        const query = `UPDATE user_profile SET ${fields.join(', ')} WHERE id = 1`;
        tx.executeSql(
          query,
          values,
          () => resolve(),
          (_, error) => {
            console.error('Error updating user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};
