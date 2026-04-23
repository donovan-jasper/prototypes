import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('workflow.db');

const WorkflowService = {
  initializeDatabase: async () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS workflows (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, steps TEXT, connections TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);',
            [],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  createWorkflow: async (workflow) => {
    await WorkflowService.initializeDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO workflows (name, steps, connections) VALUES (?, ?, ?)',
            [workflow.name, JSON.stringify(workflow.steps), JSON.stringify(workflow.connections)],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  getWorkflows: async () => {
    await WorkflowService.initializeDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM workflows',
            [],
            (_, { rows }) => resolve(rows._array),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  getWorkflowById: async (id) => {
    await WorkflowService.initializeDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM workflows WHERE id = ?',
            [id],
            (_, { rows }) => resolve(rows._array[0]),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  updateWorkflow: async (id, workflow) => {
    await WorkflowService.initializeDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE workflows SET name = ?, steps = ?, connections = ? WHERE id = ?',
            [workflow.name, JSON.stringify(workflow.steps), JSON.stringify(workflow.connections), id],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  deleteWorkflow: async (id) => {
    await WorkflowService.initializeDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM workflows WHERE id = ?',
            [id],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },
};

export default WorkflowService;
