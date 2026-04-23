import * as SQLite from 'expo-sqlite';
import { Relationship, RelationshipWithHealth, RelationshipHealth } from '../types';
import { formatDistanceToNow, parseISO } from 'date-fns';

const db = SQLite.openDatabase('kinkeeper.db');

export const initializeDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      // Create relationships table if it doesn't exist
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS relationships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          frequency TEXT NOT NULL,
          importance INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          phoneNumber TEXT,
          nextCheckIn TEXT
        );`,
        [],
        () => {
          // Create interactions table if it doesn't exist
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS interactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              relationshipId INTEGER NOT NULL,
              type TEXT NOT NULL,
              notes TEXT,
              timestamp TEXT NOT NULL,
              FOREIGN KEY (relationshipId) REFERENCES relationships (id) ON DELETE CASCADE
            );`,
            [],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getRelationships = async (category: string = 'All'): Promise<RelationshipWithHealth[]> => {
  try {
    const relationships = await new Promise<Relationship[]>((resolve, reject) => {
      db.transaction(tx => {
        const query = category === 'All'
          ? 'SELECT * FROM relationships ORDER BY name COLLATE NOCASE'
          : 'SELECT * FROM relationships WHERE category = ? ORDER BY name COLLATE NOCASE';

        tx.executeSql(
          query,
          category === 'All' ? [] : [category],
          (_, { rows }) => resolve(rows._array as Relationship[]),
          (_, error) => reject(error)
        );
      });
    });

    // For each relationship, get the last interaction and calculate health
    const relationshipsWithHealth = await Promise.all(
      relationships.map(async (relationship) => {
        const lastInteraction = await new Promise<{ timestamp: string } | null>((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT timestamp FROM interactions WHERE relationshipId = ? ORDER BY timestamp DESC LIMIT 1',
              [relationship.id],
              (_, { rows }) => resolve(rows._array[0] || null),
              (_, error) => reject(error)
            );
          });
        });

        return {
          ...relationship,
          health: calculateHealth(relationship, lastInteraction?.timestamp || null)
        };
      })
    );

    return relationshipsWithHealth;
  } catch (error) {
    console.error('Error fetching relationships:', error);
    throw error;
  }
};

export const calculateHealth = (relationship: Relationship, lastInteractionTimestamp: string | null): RelationshipHealth => {
  const now = new Date();
  let daysSinceContact = 0;
  let isOverdue = false;

  if (lastInteractionTimestamp) {
    const lastInteractionDate = parseISO(lastInteractionTimestamp);
    const diffInMs = now.getTime() - lastInteractionDate.getTime();
    daysSinceContact = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  } else {
    // If no interactions, calculate days since relationship was created
    const createdDate = parseISO(relationship.createdAt);
    const diffInMs = now.getTime() - createdDate.getTime();
    daysSinceContact = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  // Determine if the relationship is overdue based on frequency
  const frequencyDays = getFrequencyDays(relationship.frequency);
  isOverdue = daysSinceContact > frequencyDays;

  // Calculate health score (0-100)
  let score = 100;

  if (daysSinceContact > 0) {
    // Decrease score based on how many days overdue
    const overdueDays = Math.max(0, daysSinceContact - frequencyDays);
    score = Math.max(0, 100 - (overdueDays * 2)); // Decrease by 2 points per day overdue

    // Additional penalty for very neglected relationships
    if (overdueDays > 30) {
      score = Math.max(0, score - (overdueDays - 30) * 3); // Additional 3 points per day after 30 days
    }
  }

  // Adjust score based on importance (1-5 scale)
  // Importance 1: 80% of base score, Importance 5: 100% of base score
  const importanceFactor = 0.8 + (relationship.importance * 0.04);
  score = score * importanceFactor;

  // Ensure score is between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine health status
  let status: 'healthy' | 'at-risk' | 'neglected' = 'healthy';
  if (score < 50) status = 'neglected';
  else if (score < 80) status = 'at-risk';

  return {
    score,
    status,
    daysSinceContact,
    isOverdue,
    lastInteractionTimestamp
  };
};

const getFrequencyDays = (frequency: string): number => {
  switch (frequency) {
    case 'Weekly':
      return 7;
    case 'Monthly':
      return 30;
    case 'Quarterly':
      return 90;
    default:
      return 30; // Default to monthly
  }
};

export const createRelationship = async (relationship: Omit<Relationship, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO relationships (name, category, frequency, importance, createdAt, phoneNumber, nextCheckIn) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          relationship.name,
          relationship.category,
          relationship.frequency,
          relationship.importance,
          relationship.createdAt,
          relationship.phoneNumber || null,
          relationship.nextCheckIn || null
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateRelationship = async (id: number, updates: Partial<Relationship>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      tx.executeSql(
        `UPDATE relationships SET ${fields} WHERE id = ?`,
        [...values, id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteRelationship = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM relationships WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRelationshipById = async (id: number): Promise<RelationshipWithHealth | null> => {
  try {
    const relationship = await new Promise<Relationship | null>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM relationships WHERE id = ?',
          [id],
          (_, { rows }) => resolve(rows._array[0] || null),
          (_, error) => reject(error)
        );
      });
    });

    if (!relationship) return null;

    const lastInteraction = await new Promise<{ timestamp: string } | null>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT timestamp FROM interactions WHERE relationshipId = ? ORDER BY timestamp DESC LIMIT 1',
          [relationship.id],
          (_, { rows }) => resolve(rows._array[0] || null),
          (_, error) => reject(error)
        );
      });
    });

    return {
      ...relationship,
      health: calculateHealth(relationship, lastInteraction?.timestamp || null),
      lastInteraction: lastInteraction ? { timestamp: lastInteraction.timestamp } : undefined
    };
  } catch (error) {
    console.error('Error fetching relationship by ID:', error);
    throw error;
  }
};
