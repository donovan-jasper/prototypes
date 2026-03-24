import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('workflow.db');

const WorkflowService = {
  createWorkflow: async (workflow) => {
    const query = 'INSERT INTO workflows (name, steps) VALUES (?, ?)';
    const params = [workflow.name, JSON.stringify(workflow.steps)];
    await db.transaction((tx) => {
      tx.executeSql(query, params);
    });
  },
  getWorkflows: async () => {
    const query = 'SELECT * FROM workflows';
    const results = await db.transaction((tx) => {
      tx.executeSql(query, [], (_, { rows }) => {
        return rows._array;
      });
    });
    return results;
  },
};

export default WorkflowService;
