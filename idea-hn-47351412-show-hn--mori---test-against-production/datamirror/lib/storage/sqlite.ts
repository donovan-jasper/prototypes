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
  db.exec(
    [
      {
        sql: 'INSERT INTO snapshots (id, name, source_connection, created_at, row_count, file_path) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
          snapshot.id,
          snapshot.name,
          snapshot.source_connection,
          snapshot.created_at,
          snapshot.row_count,
          snapshot.file_path,
        ],
      },
    ],
    false,
    () => console.log('Snapshot saved'),
    (error) => console.error('Failed to save snapshot', error)
  );
}

export function getSnapshots() {
  return new Promise((resolve, reject) => {
    db.exec(
      [{ sql: 'SELECT * FROM snapshots', args: [] }],
      false,
      (_, result) => resolve(result.rows._array),
      (_, error) => reject(error)
    );
  });
}

export function saveConnection(connection) {
  db.exec(
    [
      {
        sql: 'INSERT INTO connections (id, name, type, host, port, database, username, encrypted_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          connection.id,
          connection.name,
          connection.type,
          connection.host,
          connection.port,
          connection.database,
          connection.username,
          connection.encrypted_password,
        ],
      },
    ],
    false,
    () => console.log('Connection saved'),
    (error) => console.error('Failed to save connection', error)
  );
}

export function getConnections() {
  return new Promise((resolve, reject) => {
    db.exec(
      [{ sql: 'SELECT * FROM connections', args: [] }],
      false,
      (_, result) => resolve(result.rows._array),
      (_, error) => reject(error)
    );
  });
}

export function saveQuery(query) {
  db.exec(
    [
      {
        sql: 'INSERT INTO query_history (id, snapshot_id, query, executed_at, duration_ms) VALUES (?, ?, ?, ?, ?)',
        args: [
          query.id,
          query.snapshot_id,
          query.query,
          query.executed_at,
          query.duration_ms,
        ],
      },
    ],
    false,
    () => console.log('Query saved'),
    (error) => console.error('Failed to save query', error)
  );
}

export function getQueryHistory(snapshotId) {
  return new Promise((resolve, reject) => {
    db.exec(
      [
        {
          sql: 'SELECT * FROM query_history WHERE snapshot_id = ? ORDER BY executed_at DESC',
          args: [snapshotId],
        },
      ],
      false,
      (_, result) => resolve(result.rows._array),
      (_, error) => reject(error)
    );
  });
}
