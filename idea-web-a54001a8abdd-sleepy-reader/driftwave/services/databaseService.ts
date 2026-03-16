import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.WebSQLDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = SQLite.openDatabase('driftwave.db');

    // Create tables if they don't exist
    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS sleep_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        duration INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        sleep_stages TEXT NOT NULL
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS content_library (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL,
        is_premium INTEGER NOT NULL,
        type TEXT NOT NULL
      );
    `);
  }

  private executeSql(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  }

  async saveSleepSession(session: {
    date: string;
    duration: number;
    quality: number;
    sleepStages: { awake: number; light: number; deep: number };
  }): Promise<void> {
    await this.executeSql(
      'INSERT INTO sleep_sessions (date, duration, quality, sleep_stages) VALUES (?, ?, ?, ?)',
      [
        session.date,
        session.duration,
        session.quality,
        JSON.stringify(session.sleepStages),
      ]
    );
  }

  async getSleepSession(date: string): Promise<any> {
    const result = await this.executeSql(
      'SELECT * FROM sleep_sessions WHERE date = ?',
      [date]
    );

    if (result.rows.length > 0) {
      const session = result.rows.item(0);
      session.sleepStages = JSON.parse(session.sleep_stages);
      return session;
    }

    return null;
  }

  async getSleepHistory(days: number): Promise<any[]> {
    const result = await this.executeSql(
      'SELECT * FROM sleep_sessions ORDER BY date DESC LIMIT ?',
      [days]
    );

    const history = [];
    for (let i = 0; i < result.rows.length; i++) {
      const session = result.rows.item(i);
      session.sleepStages = JSON.parse(session.sleep_stages);
      history.push(session);
    }

    return history;
  }

  async savePreference(key: string, value: string): Promise<void> {
    await this.executeSql(
      'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  async getPreference(key: string): Promise<string | null> {
    const result = await this.executeSql(
      'SELECT value FROM user_preferences WHERE key = ?',
      [key]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0).value;
    }

    return null;
  }

  async saveContentLibrary(contents: any[]): Promise<void> {
    // Clear existing content
    await this.executeSql('DELETE FROM content_library');

    // Insert new content
    for (const content of contents) {
      await this.executeSql(
        'INSERT INTO content_library (id, title, duration, is_premium, type) VALUES (?, ?, ?, ?, ?)',
        [
          content.id,
          content.title,
          content.duration,
          content.isPremium ? 1 : 0,
          content.type,
        ]
      );
    }
  }

  async getContentLibrary(): Promise<any[]> {
    const result = await this.executeSql('SELECT * FROM content_library');

    const contents = [];
    for (let i = 0; i < result.rows.length; i++) {
      contents.push(result.rows.item(i));
    }

    return contents;
  }
}

export const databaseService = new DatabaseService();
