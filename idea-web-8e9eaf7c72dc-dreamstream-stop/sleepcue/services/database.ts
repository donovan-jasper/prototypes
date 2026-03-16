import * as SQLite from 'expo-sqlite';

interface SleepSession {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  confidence: number;
  batterySaved: number;
}

interface UserSettings {
  rewindAmount: number;
  detectionSensitivity: number;
  fadeDuration: number;
  isPremium: boolean;
}

interface BatteryStats {
  totalSaved: number;
  weeklySavings: number;
  monthlySavings: number;
}

export class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('sleepcue.db');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.transaction(tx => {
      // Create sleep_sessions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sleep_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          startTime TEXT NOT NULL,
          endTime TEXT NOT NULL,
          duration INTEGER NOT NULL,
          confidence REAL NOT NULL,
          batterySaved REAL NOT NULL
        );`
      );

      // Create user_settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rewindAmount INTEGER DEFAULT 2,
          detectionSensitivity INTEGER DEFAULT 5,
          fadeDuration INTEGER DEFAULT 3,
          isPremium INTEGER DEFAULT 0
        );`
      );

      // Create battery_stats table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS battery_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          totalSaved REAL DEFAULT 0,
          weeklySavings REAL DEFAULT 0,
          monthlySavings REAL DEFAULT 0
        );`
      );

      // Initialize user settings if empty
      tx.executeSql(
        `INSERT INTO user_settings (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM user_settings);`
      );

      // Initialize battery stats if empty
      tx.executeSql(
        `INSERT INTO battery_stats (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM battery_stats);`
      );
    });
  }

  // Sleep Sessions
  public async addSleepSession(session: Omit<SleepSession, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO sleep_sessions (startTime, endTime, duration, confidence, batterySaved)
           VALUES (?, ?, ?, ?, ?);`,
          [session.startTime, session.endTime, session.duration, session.confidence, session.batterySaved],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  }

  public async getSleepSessions(limit: number = 10): Promise<SleepSession[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM sleep_sessions ORDER BY startTime DESC LIMIT ?;`,
          [limit],
          (_, { rows }) => resolve(rows._array as SleepSession[]),
          (_, error) => reject(error)
        );
      });
    });
  }

  // User Settings
  public async getUserSettings(): Promise<UserSettings> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM user_settings LIMIT 1;`,
          [],
          (_, { rows }) => {
            const settings = rows._array[0] as UserSettings;
            settings.isPremium = settings.isPremium === 1;
            resolve(settings);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  public async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const updates = [];
        const params = [];

        if (settings.rewindAmount !== undefined) {
          updates.push('rewindAmount = ?');
          params.push(settings.rewindAmount);
        }
        if (settings.detectionSensitivity !== undefined) {
          updates.push('detectionSensitivity = ?');
          params.push(settings.detectionSensitivity);
        }
        if (settings.fadeDuration !== undefined) {
          updates.push('fadeDuration = ?');
          params.push(settings.fadeDuration);
        }
        if (settings.isPremium !== undefined) {
          updates.push('isPremium = ?');
          params.push(settings.isPremium ? 1 : 0);
        }

        if (updates.length === 0) {
          resolve();
          return;
        }

        tx.executeSql(
          `UPDATE user_settings SET ${updates.join(', ')} WHERE id = 1;`,
          params,
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Battery Stats
  public async getBatteryStats(): Promise<BatteryStats> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM battery_stats LIMIT 1;`,
          [],
          (_, { rows }) => resolve(rows._array[0] as BatteryStats),
          (_, error) => reject(error)
        );
      });
    });
  }

  public async updateBatteryStats(stats: Partial<BatteryStats>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const updates = [];
        const params = [];

        if (stats.totalSaved !== undefined) {
          updates.push('totalSaved = totalSaved + ?');
          params.push(stats.totalSaved);
        }
        if (stats.weeklySavings !== undefined) {
          updates.push('weeklySavings = weeklySavings + ?');
          params.push(stats.weeklySavings);
        }
        if (stats.monthlySavings !== undefined) {
          updates.push('monthlySavings = monthlySavings + ?');
          params.push(stats.monthlySavings);
        }

        if (updates.length === 0) {
          resolve();
          return;
        }

        tx.executeSql(
          `UPDATE battery_stats SET ${updates.join(', ')} WHERE id = 1;`,
          params,
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }
}
