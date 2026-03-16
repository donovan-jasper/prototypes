import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('memorymate.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        trigger_type TEXT,
        trigger_value TEXT,
        completed INTEGER,
        created_at TEXT,
        user_id TEXT,
        space_id TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS spaces (
        id TEXT PRIMARY KEY,
        name TEXT,
        members TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS space_memories (
        space_id TEXT,
        memory_id TEXT,
        PRIMARY KEY (space_id, memory_id),
        FOREIGN KEY (space_id) REFERENCES spaces(id),
        FOREIGN KEY (memory_id) REFERENCES memories(id)
      );`
    );
  });
};

export const createMemory = (memory: any, callback: (id: string) => void) => {
  const id = Date.now().toString();
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO memories (id, title, description, trigger_type, trigger_value, completed, created_at, user_id, space_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, memory.title, memory.description, memory.trigger_type, memory.trigger_value, memory.completed ? 1 : 0, new Date().toISOString(), memory.user_id, memory.space_id],
      () => callback(id)
    );
  });
};

export const getMemories = (callback: (memories: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM memories;`,
      [],
      (_, { rows }) => callback(rows._array)
    );
  });
};

export const updateMemory = (id: string, updates: any, callback: () => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE memories SET title = ?, description = ?, trigger_type = ?, trigger_value = ?, completed = ? WHERE id = ?;`,
      [updates.title, updates.description, updates.trigger_type, updates.trigger_value, updates.completed ? 1 : 0, id],
      () => callback()
    );
  });
};

export const deleteMemory = (id: string, callback: () => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM memories WHERE id = ?;`,
      [id],
      () => callback()
    );
  });
};

export const createSpace = (space: any, callback: (id: string) => void) => {
  const id = Date.now().toString();
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO spaces (id, name, members) VALUES (?, ?, ?);`,
      [id, space.name, JSON.stringify(space.members)],
      () => callback(id)
    );
  });
};

export const addMemberToSpace = (spaceId: string, member: any, callback: () => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT members FROM spaces WHERE id = ?;`,
      [spaceId],
      (_, { rows }) => {
        const members = JSON.parse(rows._array[0].members);
        members.push(member);
        tx.executeSql(
          `UPDATE spaces SET members = ? WHERE id = ?;`,
          [JSON.stringify(members), spaceId],
          () => callback()
        );
      }
    );
  });
};
