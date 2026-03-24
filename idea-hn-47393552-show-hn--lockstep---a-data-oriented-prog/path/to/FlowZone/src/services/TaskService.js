import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('task.db');

const TaskService = {
  createTask: async (task) => {
    const query = 'INSERT INTO tasks (name, workflowId) VALUES (?, ?)';
    const params = [task.name, task.workflowId];
    await db.transaction((tx) => {
      tx.executeSql(query, params);
    });
  },
  getTasks: async () => {
    const query = 'SELECT * FROM tasks';
    const results = await db.transaction((tx) => {
      tx.executeSql(query, [], (_, { rows }) => {
        return rows._array;
      });
    });
    return results;
  },
};

export default TaskService;
