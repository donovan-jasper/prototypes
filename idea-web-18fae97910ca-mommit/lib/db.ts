import * as SQLite from 'expo-sqlite';
import { Memory, Space, TriggerType } from './types';

const db = SQLite.openDatabase('memorymate.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create memories table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          trigger_type TEXT,
          trigger_value TEXT,
          completed INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          user_id TEXT NOT NULL
        );`,
        [],
        () => {
          // Create spaces table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS spaces (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              created_at TEXT NOT NULL,
              owner_id TEXT NOT NULL
            );`,
            [],
            () => {
              // Create space_members table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS space_members (
                  space_id TEXT NOT NULL,
                  user_id TEXT NOT NULL,
                  PRIMARY KEY (space_id, user_id),
                  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );`,
                [],
                () => {
                  // Create space_memories table
                  tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS space_memories (
                      space_id TEXT NOT NULL,
                      memory_id TEXT NOT NULL,
                      PRIMARY KEY (space_id, memory_id),
                      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
                      FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
                    );`,
                    [],
                    () => {
                      // Create triggers for real-time sync
                      tx.executeSql(
                        `CREATE TRIGGER IF NOT EXISTS after_memory_insert
                         AFTER INSERT ON memories
                         BEGIN
                           INSERT INTO space_memories (space_id, memory_id)
                           SELECT space_id, NEW.id
                           FROM space_members
                           WHERE user_id = NEW.user_id;
                         END;`,
                        []
                      );
                      resolve(true);
                    },
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const createMemory = async (
  title: string,
  description: string,
  triggerType: TriggerType,
  triggerValue: string,
  userId: string
): Promise<Memory> => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO memories (id, title, description, trigger_type, trigger_value, created_at, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, title, description, triggerType, triggerValue, createdAt, userId],
        (_, result) => {
          resolve({
            id,
            title,
            description,
            trigger_type: triggerType,
            trigger_value: triggerValue,
            completed: false,
            created_at: createdAt,
            user_id: userId
          });
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getMemoriesForUser = async (userId: string): Promise<Memory[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC;`,
        [userId],
        (_, { rows }) => {
          const memories: Memory[] = [];
          for (let i = 0; i < rows.length; i++) {
            memories.push(rows.item(i));
          }
          resolve(memories);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const createSpace = async (name: string, ownerId: string, members: string[]): Promise<Space> => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.transaction(tx => {
      // Create the space
      tx.executeSql(
        `INSERT INTO spaces (id, name, created_at, owner_id) VALUES (?, ?, ?, ?);`,
        [id, name, createdAt, ownerId],
        () => {
          // Add owner as member
          tx.executeSql(
            `INSERT INTO space_members (space_id, user_id) VALUES (?, ?);`,
            [id, ownerId],
            () => {
              // Add additional members
              if (members.length > 0) {
                const placeholders = members.map(() => '(?, ?)').join(',');
                const values = members.flatMap(member => [id, member]);

                tx.executeSql(
                  `INSERT INTO space_members (space_id, user_id) VALUES ${placeholders};`,
                  values,
                  () => {
                    // Return the space with all members
                    tx.executeSql(
                      `SELECT s.*, GROUP_CONCAT(sm.user_id) as members
                       FROM spaces s
                       LEFT JOIN space_members sm ON s.id = sm.space_id
                       WHERE s.id = ?
                       GROUP BY s.id;`,
                      [id],
                      (_, { rows }) => {
                        const spaceData = rows.item(0);
                        const space: Space = {
                          id: spaceData.id,
                          name: spaceData.name,
                          created_at: spaceData.created_at,
                          owner_id: spaceData.owner_id,
                          members: spaceData.members ? spaceData.members.split(',') : []
                        };
                        resolve(space);
                      },
                      (_, error) => reject(error)
                    );
                  },
                  (_, error) => reject(error)
                );
              } else {
                // Return the space with just the owner
                resolve({
                  id,
                  name,
                  created_at: createdAt,
                  owner_id: ownerId,
                  members: [ownerId]
                });
              }
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getSpacesForUser = async (userId: string): Promise<Space[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT s.*, GROUP_CONCAT(sm.user_id) as members
         FROM spaces s
         JOIN space_members sm ON s.id = sm.space_id
         WHERE sm.user_id = ?
         GROUP BY s.id;`,
        [userId],
        (_, { rows }) => {
          const spaces: Space[] = [];
          for (let i = 0; i < rows.length; i++) {
            const spaceData = rows.item(i);
            spaces.push({
              id: spaceData.id,
              name: spaceData.name,
              created_at: spaceData.created_at,
              owner_id: spaceData.owner_id,
              members: spaceData.members ? spaceData.members.split(',') : []
            });
          }
          resolve(spaces);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getSpaceById = async (spaceId: string): Promise<Space> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT s.*, GROUP_CONCAT(sm.user_id) as members
         FROM spaces s
         LEFT JOIN space_members sm ON s.id = sm.space_id
         WHERE s.id = ?
         GROUP BY s.id;`,
        [spaceId],
        (_, { rows }) => {
          if (rows.length === 0) {
            reject(new Error('Space not found'));
            return;
          }

          const spaceData = rows.item(0);
          const space: Space = {
            id: spaceData.id,
            name: spaceData.name,
            created_at: spaceData.created_at,
            owner_id: spaceData.owner_id,
            members: spaceData.members ? spaceData.members.split(',') : []
          };
          resolve(space);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addMemberToSpace = async (spaceId: string, userId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO space_members (space_id, user_id) VALUES (?, ?);`,
        [spaceId, userId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const removeMemberFromSpace = async (spaceId: string, userId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM space_members WHERE space_id = ? AND user_id = ?;`,
        [spaceId, userId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMemoriesForSpace = async (spaceId: string): Promise<Memory[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT m.*
         FROM memories m
         JOIN space_memories sm ON m.id = sm.memory_id
         WHERE sm.space_id = ?
         ORDER BY m.created_at DESC;`,
        [spaceId],
        (_, { rows }) => {
          const memories: Memory[] = [];
          for (let i = 0; i < rows.length; i++) {
            memories.push(rows.item(i));
          }
          resolve(memories);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addMemoryToSpace = async (spaceId: string, memoryId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO space_memories (space_id, memory_id) VALUES (?, ?);`,
        [spaceId, memoryId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
