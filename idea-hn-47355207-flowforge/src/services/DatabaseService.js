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
            resolve(result.rowsAffected);
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
            resolve(result.rowsAffected);
          },
          (tx, error) => {
            console.error('Error deleting application:', error);
            reject(error);
          }
        );
      });
    });
  }

  async detectSchemaChanges(oldSchema, newSchema) {
    const changes = [];

    // Check for added fields
    for (const fieldName in newSchema.properties) {
      if (!oldSchema.properties[fieldName]) {
        changes.push({
          type: 'add_field',
          field: fieldName,
          fieldType: newSchema.properties[fieldName].type
        });
      }
    }

    // Check for removed fields
    for (const fieldName in oldSchema.properties) {
      if (!newSchema.properties[fieldName]) {
        changes.push({
          type: 'remove_field',
          field: fieldName
        });
      }
    }

    // Check for type changes
    for (const fieldName in newSchema.properties) {
      if (oldSchema.properties[fieldName] &&
          oldSchema.properties[fieldName].type !== newSchema.properties[fieldName].type) {
        changes.push({
          type: 'change_type',
          field: fieldName,
          oldType: oldSchema.properties[fieldName].type,
          newType: newSchema.properties[fieldName].type
        });
      }
    }

    // Check for required changes
    const oldRequired = new Set(oldSchema.required || []);
    const newRequired = new Set(newSchema.required || []);

    for (const fieldName of oldRequired) {
      if (!newRequired.has(fieldName)) {
        changes.push({
          type: 'make_optional',
          field: fieldName
        });
      }
    }

    for (const fieldName of newRequired) {
      if (!oldRequired.has(fieldName)) {
        changes.push({
          type: 'make_required',
          field: fieldName
        });
      }
    }

    return changes;
  }

  async generateMigrationScript(changes) {
    let migrationScript = '';

    for (const change of changes) {
      switch (change.type) {
        case 'add_field':
          migrationScript += `ALTER TABLE applications ADD COLUMN ${change.field} ${this.mapTypeToSQL(change.fieldType)};\n`;
          break;
        case 'remove_field':
          migrationScript += `ALTER TABLE applications DROP COLUMN ${change.field};\n`;
          break;
        case 'change_type':
          // SQLite doesn't support direct type changes, so we need to:
          // 1. Add a new column with the new type
          // 2. Copy data from old column to new column
          // 3. Drop the old column
          // 4. Rename the new column to the old name
          migrationScript += `ALTER TABLE applications ADD COLUMN ${change.field}_new ${this.mapTypeToSQL(change.newType)};\n`;
          migrationScript += `UPDATE applications SET ${change.field}_new = CAST(${change.field} AS ${this.mapTypeToSQL(change.newType)});\n`;
          migrationScript += `ALTER TABLE applications DROP COLUMN ${change.field};\n`;
          migrationScript += `ALTER TABLE applications RENAME COLUMN ${change.field}_new TO ${change.field};\n`;
          break;
        case 'make_required':
          // SQLite doesn't support ALTER COLUMN to add NOT NULL constraints
          // We need to create a new table, copy data, and replace the old table
          migrationScript += `CREATE TABLE applications_new AS SELECT * FROM applications;\n`;
          migrationScript += `ALTER TABLE applications_new MODIFY ${change.field} ${this.mapTypeToSQL('string')} NOT NULL;\n`;
          migrationScript += `DROP TABLE applications;\n`;
          migrationScript += `ALTER TABLE applications_new RENAME TO applications;\n`;
          break;
        case 'make_optional':
          // Similar to make_required but removing NOT NULL
          migrationScript += `CREATE TABLE applications_new AS SELECT * FROM applications;\n`;
          migrationScript += `ALTER TABLE applications_new MODIFY ${change.field} ${this.mapTypeToSQL('string')};\n`;
          migrationScript += `DROP TABLE applications;\n`;
          migrationScript += `ALTER TABLE applications_new RENAME TO applications;\n`;
          break;
      }
    }

    return migrationScript;
  }

  mapTypeToSQL(type) {
    switch (type) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'REAL';
      case 'integer':
        return 'INTEGER';
      case 'boolean':
        return 'INTEGER';
      case 'date':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }

  async applyMigration(migrationScript) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        try {
          const statements = migrationScript.split(';').filter(stmt => stmt.trim() !== '');

          statements.forEach(stmt => {
            tx.executeSql(stmt);
          });

          // Update schema version
          this.currentSchemaVersion++;
          tx.executeSql('INSERT INTO schema_version (version) VALUES (?)', [this.currentSchemaVersion]);

          resolve();
        } catch (error) {
          console.error('Migration error:', error);
          reject(error);
        }
      });
    });
  }
}

export default DatabaseService;
