import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = SQLite.openDatabase('aurora-ai.db');
    this.initializeDatabase();
  }

  initializeDatabase() {
    this.db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, schema TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS schema_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, app_id INTEGER, version_number INTEGER, schema_diff TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS analytics_data (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, event_data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
    });
  }

  // Add methods for database operations
  insertApplication(name, schema) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO applications (name, schema) VALUES (?, ?)',
          [name, JSON.stringify(schema)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  getApplications() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM applications ORDER BY created_at DESC',
          [],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  updateSchemaVersion(appId, versionNumber, schemaDiff) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO schema_versions (app_id, version_number, schema_diff) VALUES (?, ?, ?)',
          [appId, versionNumber, JSON.stringify(schemaDiff)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  getSchemaVersions(appId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM schema_versions WHERE app_id = ? ORDER BY version_number ASC',
          [appId],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  logAnalyticsEvent(eventType, eventData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO analytics_data (event_type, event_data) VALUES (?, ?)',
          [eventType, JSON.stringify(eventData)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  getAnalyticsData() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM analytics_data ORDER BY timestamp DESC LIMIT 100',
          [],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }
}

export default DatabaseService;
