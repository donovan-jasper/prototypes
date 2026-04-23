import * as SQLite from 'expo-sqlite';

class DatabaseService {
  db;
  currentSchemaVersion = 1; // Current schema version

  constructor() {
    this.db = SQLite.openDatabase('applications.db');
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db.transaction(async (tx) => {
        try {
          // Create schema version table if it doesn't exist
          await this.executeSql(tx, `
            CREATE TABLE IF NOT EXISTS schema_version (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              version INTEGER NOT NULL,
              migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Create migrations table if it doesn't exist
          await this.executeSql(tx, `
            CREATE TABLE IF NOT EXISTS migrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              version INTEGER NOT NULL,
              description TEXT,
              executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Check if schema version table is empty
          const versionResult = await this.executeSql(tx, 'SELECT version FROM schema_version ORDER BY id DESC LIMIT 1');

          let dbVersion = 0;
          if (versionResult.rows.length > 0) {
            dbVersion = versionResult.rows.item(0).version;
          }

          // If no version exists or version is older, run migrations
          if (dbVersion === 0 || dbVersion < this.currentSchemaVersion) {
            await this.runMigrations(tx, dbVersion);
          }

          // Create applications table if it doesn't exist
          await this.executeSql(tx, `
            CREATE TABLE IF NOT EXISTS applications (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              schema TEXT,
              version INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);

          resolve();
        } catch (error) {
          console.error('Database initialization error:', error);
          reject(error);
        }
      });
    });
  }

  async runMigrations(tx, currentVersion) {
    // Migration from version 0 to 1
    if (currentVersion < 1) {
      // Create initial schema version
      await this.executeSql(tx, 'INSERT INTO schema_version (version) VALUES (?)', [this.currentSchemaVersion]);

      // Record the migration
      await this.executeSql(tx, 'INSERT INTO migrations (version, description) VALUES (?, ?)', [
        this.currentSchemaVersion,
        'Initial schema setup with applications table'
      ]);
    }

    // Add more migration steps here for future versions
    // if (currentVersion < 2) { ... }
  }

  async executeSql(tx, sql, params = []) {
    return new Promise((resolve, reject) => {
      tx.executeSql(
        sql,
        params,
        (tx, result) => resolve(result),
        (tx, error) => reject(error)
      );
    });
  }

  async getCurrentSchemaVersion() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT version FROM schema_version ORDER BY id DESC LIMIT 1',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0).version);
            } else {
              resolve(0);
            }
          },
          (tx, error) => {
            console.error('Error getting current schema version:', error);
            reject(error);
          }
        );
      });
    });
  }

  async getApplications() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM applications ORDER BY updated_at DESC',
          [],
          (tx, results) => {
            const applications = [];
            for (let i = 0; i < results.rows.length; i++) {
              applications.push({
                id: results.rows.item(i).id,
                name: results.rows.item(i).name,
                schema: results.rows.item(i).schema ? JSON.parse(results.rows.item(i).schema) : null,
                version: results.rows.item(i).version,
                created_at: results.rows.item(i).created_at,
                updated_at: results.rows.item(i).updated_at,
              });
            }
            resolve(applications);
          },
          (tx, error) => {
            console.error('Error fetching applications:', error);
            reject(error);
          }
        );
      });
    });
  }

  async saveApplication(applicationName, schemaData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO applications (name, schema, version) VALUES (?, ?, ?)',
          [applicationName, JSON.stringify(schemaData), this.currentSchemaVersion],
          (tx, result) => {
            resolve(result.insertId);
          },
          (tx, error) => {
            console.error('Error saving application:', error);
            reject(error);
          }
        );
      });
    });
  }

  async updateApplication(appId, applicationName, schemaData) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE applications SET name = ?, schema = ?, version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [applicationName, JSON.stringify(schemaData), this.currentSchemaVersion, appId],
          (tx, result) => {
            resolve(result.rowsAffected > 0);
          },
          (tx, error) => {
            console.error('Error updating application:', error);
            reject(error);
          }
        );
      });
    });
  }

  async deleteApplication(appId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM applications WHERE id = ?',
          [appId],
          (tx, result) => {
            resolve(result.rowsAffected > 0);
          },
          (tx, error) => {
            console.error('Delete application error:', error);
            reject(error);
          }
        );
      });
    });
  }

  async getMigrationHistory() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM migrations ORDER BY executed_at DESC',
          [],
          (tx, results) => {
            const migrations = [];
            for (let i = 0; i < results.rows.length; i++) {
              migrations.push({
                id: results.rows.item(i).id,
                version: results.rows.item(i).version,
                description: results.rows.item(i).description,
                executed_at: results.rows.item(i).executed_at,
              });
            }
            resolve(migrations);
          },
          (tx, error) => {
            console.error('Error fetching migration history:', error);
            reject(error);
          }
        );
      });
    });
  }
}

export default DatabaseService;
