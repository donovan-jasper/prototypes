import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('datamirror.db');

export function initDatabase() {
  db.exec(
    [
      `CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        name TEXT,
        source_connection TEXT,
        created_at TEXT,
        row_count INTEGER,
        file_path TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        host TEXT,
        port INTEGER,
        database TEXT,
        username TEXT,
        encrypted_password TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS query_history (
        id TEXT PRIMARY KEY,
        snapshot_id TEXT,
        query TEXT,
        executed_at TEXT,
        duration_ms INTEGER
      )`,
    ],
    false,
    () => console.log('Database initialized'),
    (error) => console.error('Database initialization failed', error)
  );
}

export function saveSnapshot(snapshot) {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO snapshots (id, name, source_connection, created_at, row_count, file_path) VALUES (?, ?, ?, ?, ?, ?)',
          [
            snapshot.id,
            snapshot.name,
            snapshot.source_connection,
            snapshot.created_at,
            snapshot.row_count,
            snapshot.file_path,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => console.log('Snapshot saved')
    );
  });
}

export function getSnapshots() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM snapshots',
          [],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
}

export function saveConnection(connection) {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO connections (id, name, type, host, port, database, username, encrypted_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            connection.id,
            connection.name,
            connection.type,
            connection.host,
            connection.port,
            connection.database,
            connection.username,
            connection.encrypted_password,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => console.log('Connection saved')
    );
  });
}

export function getConnections() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM connections',
          [],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
}

export function saveQuery(query) {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO query_history (id, snapshot_id, query, executed_at, duration_ms) VALUES (?, ?, ?, ?, ?)',
          [
            query.id,
            query.snapshot_id,
            query.query,
            query.executed_at,
            query.duration_ms,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => console.log('Query saved')
    );
  });
}

export function getQueryHistory(snapshotId) {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM query_history WHERE snapshot_id = ? ORDER BY executed_at DESC',
          [snapshotId],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
}
