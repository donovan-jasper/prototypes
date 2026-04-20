import * as SQLite from 'expo-sqlite';

// The database instance. This is opened once when the module is loaded.
const db = SQLite.openDatabase('raccoonai.db');

/**
 * Initializes the SQLite database by creating necessary tables if they don't exist.
 * This function should be called once at the application startup.
 * It also serves the purpose of the requested `openDatabase` function by ensuring
 * the database is ready for use and tables are created.
 */
const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create task_chains table to store task chain names and their associated tasks
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS task_chains (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, tasks TEXT);',
          [],
          () => console.log('task_chains table created or already exists.'),
          (_, error) => {
            console.error('Error creating task_chains table:', error);
            return true; // Indicate that the transaction should be rolled back
          }
        );

        // Create sessions table to store session history
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);',
          [],
          () => console.log('sessions table created or already exists.'),
          (_, error) => {
            console.error('Error creating sessions table:', error);
            return true; // Indicate that the transaction should be rolled back
          }
        );

        // Create connected_tools table (existing from previous code)
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS connected_tools (id INTEGER PRIMARY KEY AUTOINCREMENT, tool_name TEXT UNIQUE, status TEXT, connected_at TEXT);',
          [],
          () => console.log('connected_tools table created or already exists.'),
          (_, error) => {
            console.error('Error creating connected_tools table:', error);
            return true; // Indicate that the transaction should be rolled back
          }
        );
      },
      (error) => {
        console.error('Transaction error during database initialization:', error);
        reject(error);
      },
      () => {
        console.log('Database initialization transaction completed successfully.');
        resolve();
      }
    );
  });
};

/**
 * Adds a new task chain to the database.
 * @param {string} name - The name of the task chain.
 * @param {Array<Object>} tasks - An array of task objects associated with the chain.
 * @returns {Promise<SQLite.SQLResultSet>} A promise that resolves with the result of the insertion.
 */
const addTaskChain = async (name, tasks) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO task_chains (name, tasks) VALUES (?, ?)',
        [name, JSON.stringify(tasks)], // Store tasks as a JSON string
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Retrieves all task chains from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of task chain objects.
 */
const getTaskChains = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT id, name, tasks FROM task_chains',
        [],
        (_, { rows }) => {
          const taskChains = rows._array.map((row) => ({
            id: row.id,
            name: row.name,
            tasks: JSON.parse(row.tasks), // Parse the JSON string back to an array
          }));
          resolve(taskChains);
        },
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Saves a new session to the database.
 * @param {string} title - A title for the session.
 * @param {Object} content - The content of the session (e.g., chat history, task outcome).
 * @returns {Promise<SQLite.SQLResultSet>} A promise that resolves with the result of the insertion.
 */
const saveSession = async (title, content) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO sessions (title, content) VALUES (?, ?)',
        [title, JSON.stringify(content)], // Store content as a JSON string
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

/**
 * Retrieves all sessions from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of session objects.
 */
const getSessions = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT id, title, content, timestamp FROM sessions ORDER BY timestamp DESC',
        [],
        (_, { rows }) => {
          const sessions = rows._array.map((row) => ({
            id: row.id,
            title: row.title,
            content: JSON.parse(row.content), // Parse the JSON string back to an object
            timestamp: row.timestamp,
          }));
          resolve(sessions);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// --- Existing tool-related functions (kept as is) ---

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
  initializeDatabase, // Renamed from initDb and exported as the primary database setup function
  addTaskChain,
  getTaskChains,
  saveSession,
  getSessions,
  insertConnectedTool,
  updateConnectedToolStatus,
  getConnectedToolStatus,
  getAllConnectedTools,
};
