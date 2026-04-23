import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowzone.db');

class WorkflowService {
  static initialize() {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS workflows (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT, createdAt TEXT);'
      );
    });
  }

  static async saveWorkflow(workflow) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO workflows (data, createdAt) VALUES (?, ?);',
          [JSON.stringify(workflow), workflow.createdAt],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getWorkflows() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM workflows ORDER BY createdAt DESC;',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async deleteWorkflow(id) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM workflows WHERE id = ?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getWorkflowById(id) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM workflows WHERE id = ?;',
          [id],
          (_, { rows: { _array } }) => resolve(_array[0]),
          (_, error) => reject(error)
        );
      });
    });
  }
}

export default WorkflowService;
