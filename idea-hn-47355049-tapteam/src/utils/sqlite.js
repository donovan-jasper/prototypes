import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('raccoonai.db');

const initDb = async () => {
  await db.transaction(tx => {
    // Create task_chains table if it doesn't exist
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS task_chains (id INTEGER PRIMARY KEY AUTOINCREMENT, task_chain TEXT);',
      [],
      () => console.log('task_chains table created or already exists.'),
      (_, error) => console.error('Error creating task_chains table:', error)
    );

    // Create connected_tools table if it doesn't exist
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS connected_tools (id INTEGER PRIMARY KEY AUTOINCREMENT, tool_name TEXT UNIQUE, status TEXT, connected_at TEXT);',
      [],
      () => console.log('connected_tools table created or already exists.'),
      (_, error) => console.error('Error creating connected_tools table:', error)
    );
  });
};

const addTaskChain = async (taskChain) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO task_chains (task_chain) VALUES (?)',
        [JSON.stringify(taskChain)],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const getTaskChains = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM task_chains',
        [],
        (_, { rows }) => {
          const taskChains = rows._array.map((row) => JSON.parse(row.task_chain));
          resolve(taskChains);
        },
        (_, error) => reject(error)
      );
    });
  });
};

const insertConnectedTool = async (toolName, status, connectedAt) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO connected_tools (tool_name, status, connected_at) VALUES (?, ?, ?)',
        [toolName, status, connectedAt],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const updateConnectedToolStatus = async (toolName, status, connectedAt) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE connected_tools SET status = ?, connected_at = ? WHERE tool_name = ?',
        [status, connectedAt, toolName],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const getConnectedToolStatus = async (toolName) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT status FROM connected_tools WHERE tool_name = ?',
        [toolName],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0].status);
          } else {
            resolve(null); // Tool not found
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const getAllConnectedTools = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT tool_name, status, connected_at FROM connected_tools',
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export {
  initDb,
  addTaskChain,
  getTaskChains,
  insertConnectedTool,
  updateConnectedToolStatus,
  getConnectedToolStatus,
  getAllConnectedTools,
};
