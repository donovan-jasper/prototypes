import * as SQLite from 'expo-sqlite';
import { ActivityProfile, Session, Settings } from '../types';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('flowguard.db');
  }

  async initialize(): Promise<void> {
    // Create tables if they don't exist
    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        sensitivity INTEGER NOT NULL
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileId TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER NOT NULL,
        drowsinessEvents INTEGER NOT NULL,
        FOREIGN KEY (profileId) REFERENCES profiles (id)
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hapticEnabled INTEGER NOT NULL,
        soundEnabled INTEGER NOT NULL
      );
    `);

    // Insert default profiles if none exist
    const profiles = await this.getProfiles();
    if (profiles.length === 0) {
      await this.insertDefaultProfiles();
    }

    // Insert default settings if none exist
    const settings = await this.getSettings();
    if (!settings) {
      await this.insertDefaultSettings();
    }
  }

  private async insertDefaultProfiles(): Promise<void> {
    const defaultProfiles: Omit<ActivityProfile, 'id'>[] = [
      { name: 'Study', icon: '📚', sensitivity: 5 },
      { name: 'Work', icon: '💼', sensitivity: 5 },
      { name: 'Audiobook', icon: '🎧', sensitivity: 5 },
    ];

    for (const profile of defaultProfiles) {
      await this.executeSql(
        'INSERT INTO profiles (id, name, icon, sensitivity) VALUES (?, ?, ?, ?)',
        [Date.now().toString(), profile.name, profile.icon, profile.sensitivity]
      );
    }
  }

  private async insertDefaultSettings(): Promise<void> {
    await this.executeSql(
      'INSERT INTO settings (hapticEnabled, soundEnabled) VALUES (?, ?)',
      [1, 1]
    );
  }

  async getProfiles(): Promise<ActivityProfile[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM profiles',
          [],
          (_, { rows }) => {
            const profiles: ActivityProfile[] = [];
            for (let i = 0; i < rows.length; i++) {
              profiles.push(rows.item(i));
            }
            resolve(profiles);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async addProfile(profile: Omit<ActivityProfile, 'id'>): Promise<void> {
    await this.executeSql(
      'INSERT INTO profiles (id, name, icon, sensitivity) VALUES (?, ?, ?, ?)',
      [Date.now().toString(), profile.name, profile.icon, profile.sensitivity]
    );
  }

  async updateProfile(profile: ActivityProfile): Promise<void> {
    await this.executeSql(
      'UPDATE profiles SET name = ?, icon = ?, sensitivity = ? WHERE id = ?',
      [profile.name, profile.icon, profile.sensitivity, profile.id]
    );
  }

  async deleteProfile(profileId: string): Promise<void> {
    await this.executeSql(
      'DELETE FROM profiles WHERE id = ?',
      [profileId]
    );
  }

  async saveSession(session: Omit<Session, 'id'>): Promise<number> {
    const result = await this.executeSql(
      'INSERT INTO sessions (profileId, startTime, endTime, drowsinessEvents) VALUES (?, ?, ?, ?)',
      [session.profileId, session.startTime, session.endTime, session.drowsinessEvents]
    );
    return result.insertId;
  }

  async getSessions(): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sessions ORDER BY startTime DESC',
          [],
          (_, { rows }) => {
            const sessions: Session[] = [];
            for (let i = 0; i < rows.length; i++) {
              sessions.push(rows.item(i));
            }
            resolve(sessions);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getWeeklyStats(): Promise<{ totalSessions: number; totalDuration: number }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as totalSessions, SUM(endTime - startTime) as totalDuration FROM sessions WHERE startTime >= ?',
          [sevenDaysAgo],
          (_, { rows }) => {
            const result = rows.item(0);
            resolve({
              totalSessions: result.totalSessions || 0,
              totalDuration: result.totalDuration || 0,
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getSettings(): Promise<Settings | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const settings = rows.item(0);
              resolve({
                hapticEnabled: settings.hapticEnabled === 1,
                soundEnabled: settings.soundEnabled === 1,
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async updateSettings(settings: Settings): Promise<void> {
    await this.executeSql(
      'UPDATE settings SET hapticEnabled = ?, soundEnabled = ? WHERE id = 1',
      [settings.hapticEnabled ? 1 : 0, settings.soundEnabled ? 1 : 0]
    );
  }

  private async executeSql(sql: string, params: any[] = []): Promise<{ insertId?: number }> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve({ insertId: result.insertId }),
          (_, error) => reject(error)
        );
      });
    });
  }

  async clearAllData(): Promise<void> {
    await this.executeSql('DELETE FROM profiles');
    await this.executeSql('DELETE FROM sessions');
    await this.executeSql('DELETE FROM settings');
  }
}
