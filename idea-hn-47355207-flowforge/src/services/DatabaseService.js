import * as SQLite from 'expo-sqlite';

class DatabaseService {
  db;

  constructor() {
    this.db = SQLite.openDatabase('applications.db');
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, schema TEXT)',
          [],
          () => {
            resolve();
          },
          (tx, error) => {
            console.error('Error creating table:', error);
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
          'SELECT * FROM applications ORDER BY id DESC',
          [],
          (tx, results) => {
            const applications = [];
            for (let i = 0; i < results.rows.length; i++) {
              applications.push({
                id: results.rows.item(i).id,
                name: results.rows.item(i).name,
                schema: results.rows.item(i).schema,
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
          'INSERT INTO applications (name, schema) VALUES (?, ?)',
          [applicationName, JSON.stringify(schemaData)],
          () => {
            resolve();
          },
          (tx, error) => {
            console.error('Error saving application:', error);
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
          () => {
            resolve();
          },
          (tx, error) => {
            console.error('Delete application error:', error);
            reject(error);
          }
        );
      });
    });
  }
}

export default DatabaseService;
