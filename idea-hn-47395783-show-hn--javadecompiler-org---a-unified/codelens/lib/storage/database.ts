import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('codelens.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS decompilations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT,
        fileSize INTEGER,
        fileHash TEXT,
        decompiled BOOLEAN,
        timestamp INTEGER
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS security_findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decompilationId INTEGER,
        type TEXT,
        severity TEXT,
        description TEXT,
        FOREIGN KEY (decompilationId) REFERENCES decompilations (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        darkMode BOOLEAN,
        subscriptionTier TEXT,
        lastUpdated INTEGER
      );`
    );
  });
};

export const saveDecompilation = (decompilation) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO decompilations (fileName, fileSize, fileHash, decompiled, timestamp) VALUES (?, ?, ?, ?, ?)',
        [decompilation.fileName, decompilation.fileSize, decompilation.fileHash, decompilation.decompiled, decompilation.timestamp],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRecentDecompilations = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM decompilations ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllDecompilations = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM decompilations',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getDecompilation = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM decompilations WHERE id = ?',
        [id],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveSecurityFindings = (decompilationId, findings) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      findings.forEach((finding) => {
        tx.executeSql(
          'INSERT INTO security_findings (decompilationId, type, severity, description) VALUES (?, ?, ?, ?)',
          [decompilationId, finding.type, finding.severity, finding.description],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  });
};

export const getSecurityFindings = (decompilationId) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM security_findings WHERE decompilationId = ?',
        [decompilationId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveUserSettings = (settings) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO user_settings (id, darkMode, subscriptionTier, lastUpdated) VALUES (1, ?, ?, ?)',
        [settings.darkMode, settings.subscriptionTier, settings.lastUpdated],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserSettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM user_settings WHERE id = 1',
        [],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};
