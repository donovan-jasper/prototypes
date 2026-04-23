import * as SQLite from 'expo-sqlite';
import { Restaurant, Inspection, UserList } from '@/types';

const db = SQLite.openDatabase('safebite.db');

class DatabaseService {
  constructor() {
    this.initializeDatabase();
  }

  // Initialize database tables
  initializeDatabase() {
    db.transaction(tx => {
      // Restaurants table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS restaurants (
          id TEXT PRIMARY KEY,
          name TEXT,
          address TEXT,
          latitude REAL,
          longitude REAL,
          safetyScore INTEGER,
          lastInspectionDate TEXT,
          violationCount INTEGER,
          cuisine TEXT,
          cachedAt TEXT
        );`
      );

      // Inspections table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS inspections (
          id TEXT PRIMARY KEY,
          restaurantId TEXT,
          date TEXT,
          score INTEGER,
          FOREIGN KEY (restaurantId) REFERENCES restaurants (id)
        );`
      );

      // Violations table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS violations (
          id TEXT PRIMARY KEY,
          inspectionId TEXT,
          description TEXT,
          severity TEXT,
          FOREIGN KEY (inspectionId) REFERENCES inspections (id)
        );`
      );

      // User lists table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS userLists (
          id TEXT PRIMARY KEY,
          name TEXT,
          createdAt TEXT
        );`
      );

      // List items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS listItems (
          listId TEXT,
          restaurantId TEXT,
          PRIMARY KEY (listId, restaurantId),
          FOREIGN KEY (listId) REFERENCES userLists (id),
          FOREIGN KEY (restaurantId) REFERENCES restaurants (id)
        );`
      );
    });
  }

  // Cache restaurants with their location context
  async cacheRestaurants(restaurants: Restaurant[], latitude: number, longitude: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First clear old cached data for this location
        tx.executeSql(
          'DELETE FROM restaurants WHERE cachedAt < datetime("now", "-7 days")',
          [],
          () => {
            // Then insert new data
            restaurants.forEach(restaurant => {
              tx.executeSql(
                `INSERT OR REPLACE INTO restaurants
                (id, name, address, latitude, longitude, safetyScore, lastInspectionDate, violationCount, cuisine, cachedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [
                  restaurant.id,
                  restaurant.name,
                  restaurant.address,
                  restaurant.latitude,
                  restaurant.longitude,
                  restaurant.safetyScore,
                  restaurant.lastInspectionDate,
                  restaurant.violationCount,
                  restaurant.cuisine
                ]
              );
            });
          },
          (_, error) => {
            reject(error);
            return false;
          },
          () => {
            resolve();
          }
        );
      });
    });
  }

  // Get cached restaurants near a specific location
  async getCachedRestaurants(latitude: number, longitude: number, radius: number = 0.5): Promise<Restaurant[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM restaurants
           WHERE (latitude BETWEEN ? AND ?)
           AND (longitude BETWEEN ? AND ?)
           AND cachedAt > datetime('now', '-1 day')`,
          [
            latitude - radius,
            latitude + radius,
            longitude - radius,
            longitude + radius
          ],
          (_, { rows }) => {
            const restaurants: Restaurant[] = [];
            for (let i = 0; i < rows.length; i++) {
              restaurants.push(rows.item(i));
            }
            resolve(restaurants);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Cache inspection data for a restaurant
  async cacheInspections(restaurantId: string, inspections: Inspection[]): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First clear old inspections for this restaurant
        tx.executeSql(
          'DELETE FROM inspections WHERE restaurantId = ?',
          [restaurantId],
          () => {
            // Then insert new inspections
            inspections.forEach(inspection => {
              tx.executeSql(
                `INSERT OR REPLACE INTO inspections
                (id, restaurantId, date, score)
                VALUES (?, ?, ?, ?)`,
                [
                  inspection.id,
                  inspection.restaurantId,
                  inspection.date,
                  inspection.score
                ],
                () => {
                  // Insert violations for this inspection
                  inspection.violations.forEach(violation => {
                    tx.executeSql(
                      `INSERT OR REPLACE INTO violations
                      (id, inspectionId, description, severity)
                      VALUES (?, ?, ?, ?)`,
                      [
                        violation.id,
                        inspection.id,
                        violation.description,
                        violation.severity
                      ]
                    );
                  });
                }
              );
            });
          },
          (_, error) => {
            reject(error);
            return false;
          },
          () => {
            resolve();
          }
        );
      });
    });
  }

  // Get cached inspections for a restaurant
  async getCachedInspections(restaurantId: string): Promise<Inspection[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT i.*, v.id as violationId, v.description, v.severity
           FROM inspections i
           LEFT JOIN violations v ON i.id = v.inspectionId
           WHERE i.restaurantId = ?
           ORDER BY i.date DESC`,
          [restaurantId],
          (_, { rows }) => {
            const inspectionsMap = new Map<string, Inspection>();

            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              const inspectionId = row.id;

              if (!inspectionsMap.has(inspectionId)) {
                inspectionsMap.set(inspectionId, {
                  id: inspectionId,
                  restaurantId: row.restaurantId,
                  date: row.date,
                  score: row.score,
                  violations: []
                });
              }

              if (row.violationId) {
                const inspection = inspectionsMap.get(inspectionId);
                if (inspection) {
                  inspection.violations.push({
                    id: row.violationId,
                    description: row.description,
                    severity: row.severity as 'low' | 'medium' | 'high'
                  });
                }
              }
            }

            resolve(Array.from(inspectionsMap.values()));
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Create a new user list
  async createUserList(name: string): Promise<UserList> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9);
      const createdAt = new Date().toISOString();

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO userLists (id, name, createdAt)
           VALUES (?, ?, ?)`,
          [id, name, createdAt],
          () => {
            resolve({
              id,
              name,
              restaurantIds: [],
              createdAt
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Get all user lists
  async getUserLists(): Promise<UserList[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT l.*, GROUP_CONCAT(li.restaurantId) as restaurantIds
           FROM userLists l
           LEFT JOIN listItems li ON l.id = li.listId
           GROUP BY l.id`,
          [],
          (_, { rows }) => {
            const lists: UserList[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              lists.push({
                id: row.id,
                name: row.name,
                restaurantIds: row.restaurantIds ? row.restaurantIds.split(',') : [],
                createdAt: row.createdAt
              });
            }
            resolve(lists);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Add restaurant to a list
  async addRestaurantToList(listId: string, restaurantId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR IGNORE INTO listItems (listId, restaurantId)
           VALUES (?, ?)`,
          [listId, restaurantId],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Remove restaurant from a list
  async removeRestaurantFromList(listId: string, restaurantId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM listItems
           WHERE listId = ? AND restaurantId = ?`,
          [listId, restaurantId],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Clear old cache entries
  async clearOldCache(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM restaurants WHERE cachedAt < datetime("now", "-7 days")',
          [],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
