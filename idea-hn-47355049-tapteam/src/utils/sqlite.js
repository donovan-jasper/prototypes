import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('raccoonai.db');

const addTaskChain = async (taskChain) => {
  await db.transaction((tx) => {
    tx.executeSql('INSERT INTO task_chains (task_chain) VALUES (?)', [JSON.stringify(taskChain)]);
  });
};

const getTaskChains = async () => {
  const taskChains = [];
  await db.transaction((tx) => {
    tx.executeSql('SELECT * FROM task_chains', [], (_, { rows }) => {
      rows._array.forEach((row) => {
        taskChains.push(JSON.parse(row.task_chain));
      });
    });
  });
  return taskChains;
};

export { addTaskChain, getTaskChains };
