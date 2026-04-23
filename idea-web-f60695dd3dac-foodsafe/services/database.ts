import * as SQLite from 'expo-sqlite';
import { Restaurant, Inspection, UserList } from '@/types';

const db = SQLite.openDatabase('safebite.db');

// Initialize database tables
export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create restaurants table
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

        // Create inspections table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            restaurantId TEXT,
            date TEXT,
            score INTEGER,
            FOREIGN KEY (restaurantId) REFERENCES restaurants (id)
          );`
        );

        // Create violations table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS violations (
            id TEXT PRIMARY KEY,
            inspectionId TEXT,
            description TEXT,
            severity TEXT,
            FOREIGN KEY (inspectionId) REFERENCES inspections (id)
          );`
        );

        // Create user lists table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS userLists (
            id TEXT PRIMARY KEY,
            name TEXT,
            createdAt TEXT
          );`
        );

        // Create list items table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS listItems (
            listId TEXT,
            restaurantId TEXT,
            PRIMARY KEY (listId, restaurantId),
            FOREIGN KEY (listId) REFERENCES userLists (id),
            FOREIGN KEY (restaurantId) REFERENCES restaurants (id)
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// Cache restaurant data
export const cacheRestaurant = async (restaurant: Restaurant) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO restaurants (
            id, name, address, latitude, longitude, safetyScore,
            lastInspectionDate, violationCount, cuisine, cachedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            restaurant.id,
            restaurant.name,
            restaurant.address,
            restaurant.latitude,
            restaurant.longitude,
            restaurant.safetyScore,
            restaurant.lastInspectionDate,
            restaurant.violationCount,
            restaurant.cuisine,
            new Date().toISOString(),
          ],
          () => resolve(),
          (_, error) => {
            console.error('Error caching restaurant:', error);
            reject(error);
          }
        );
      }
    );
  });
};

// Cache inspection data
export const cacheInspections = async (inspections: Inspection[]) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // First insert inspections
        inspections.forEach((inspection) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO inspections (id, restaurantId, date, score) VALUES (?, ?, ?, ?);`,
            [inspection.id, inspection.restaurantId, inspection.date, inspection.score],
            () => {
              // Then insert violations for each inspection
              inspection.violations.forEach((violation) => {
                tx.executeSql(
                  `INSERT OR REPLACE INTO violations (id, inspectionId, description, severity) VALUES (?, ?, ?, ?);`,
                  [violation.id, inspection.id, violation.description, violation.severity],
                  () => {},
                  (_, error) => {
                    console.error('Error caching violation:', error);
                    reject(error);
                  }
                );
              });
            },
            (_, error) => {
              console.error('Error caching inspection:', error);
              reject(error);
            }
          );
        });
      },
      (error) => {
        console.error('Transaction failed:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

// Get cached restaurants
export const getCachedRestaurants = async (): Promise<Restaurant[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM restaurants ORDER BY cachedAt DESC LIMIT 50;`,
          [],
          (_, { rows }) => {
            const restaurants: Restaurant[] = [];
            for (let i = 0; i < rows.length; i++) {
              restaurants.push(rows.item(i) as Restaurant);
            }
            resolve(restaurants);
          },
          (_, error) => {
            console.error('Error getting cached restaurants:', error);
            reject(error);
          }
        );
      }
    );
  });
};

// Get cached inspections for a restaurant
export const getCachedInspections = async (restaurantId: string): Promise<Inspection[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM inspections WHERE restaurantId = ? ORDER BY date DESC;`,
          [restaurantId],
          (_, { rows }) => {
            const inspections: Inspection[] = [];
            for (let i = 0; i < rows.length; i++) {
              const inspection = rows.item(i) as Inspection;
              inspections.push(inspection);
            }

            // Now get violations for each inspection
            const inspectionPromises = inspections.map((inspection) => {
              return new Promise<Inspection>((resolveInspection) => {
                tx.executeSql(
                  `SELECT * FROM violations WHERE inspectionId = ?;`,
                  [inspection.id],
                  (_, { rows: violationRows }) => {
                    const violations = [];
                    for (let j = 0; j < violationRows.length; j++) {
                      violations.push(violationRows.item(j));
                    }
                    inspection.violations = violations;
                    resolveInspection(inspection);
                  },
                  (_, error) => {
                    console.error('Error getting violations:', error);
                    inspection.violations = [];
                    resolveInspection(inspection);
                  }
                );
              });
            });

            Promise.all(inspectionPromises).then(resolve).catch(reject);
          },
          (_, error) => {
            console.error('Error getting cached inspections:', error);
            reject(error);
          }
        );
      }
    );
  });
};

// Clear old cache entries (older than 7 days)
export const clearOldCache = async () => {
  return new Promise<void>((resolve, reject) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    db.transaction(
      (tx) => {
        // Delete old restaurants
        tx.executeSql(
          `DELETE FROM restaurants WHERE cachedAt < ?;`,
          [sevenDaysAgo.toISOString()],
          () => {},
          (_, error) => {
            console.error('Error clearing old restaurants:', error);
          }
        );

        // Delete inspections for deleted restaurants
        tx.executeSql(
          `DELETE FROM inspections WHERE restaurantId NOT IN (SELECT id FROM restaurants);`,
          [],
          () => {},
          (_, error) => {
            console.error('Error cleaning up inspections:', error);
          }
        );

        // Delete violations for deleted inspections
        tx.executeSql(
          `DELETE FROM violations WHERE inspectionId NOT IN (SELECT id FROM inspections);`,
          [],
          () => {},
          (_, error) => {
            console.error('Error cleaning up violations:', error);
          }
        );
      },
      (error) => {
        console.error('Cache cleanup failed:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

// User lists operations
export const createUserList = async (name: string): Promise<UserList> => {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO userLists (id, name, createdAt) VALUES (?, ?, ?);`,
          [id, name, createdAt],
          () => {
            resolve({ id, name, restaurantIds: [], createdAt });
          },
          (_, error) => {
            console.error('Error creating user list:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getUserLists = async (): Promise<UserList[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM userLists ORDER BY createdAt DESC;`,
          [],
          (_, { rows }) => {
            const lists: UserList[] = [];
            for (let i = 0; i < rows.length; i++) {
              const list = rows.item(i) as UserList;
              lists.push(list);
            }

            // Now get restaurant IDs for each list
            const listPromises = lists.map((list) => {
              return new Promise<UserList>((resolveList) => {
                tx.executeSql(
                  `SELECT restaurantId FROM listItems WHERE listId = ?;`,
                  [list.id],
                  (_, { rows: restaurantRows }) => {
                    const restaurantIds = [];
                    for (let j = 0; j < restaurantRows.length; j++) {
                      restaurantIds.push(restaurantRows.item(j).restaurantId);
                    }
                    list.restaurantIds = restaurantIds;
                    resolveList(list);
                  },
                  (_, error) => {
                    console.error('Error getting list items:', error);
                    list.restaurantIds = [];
                    resolveList(list);
                  }
                );
              });
            });

            Promise.all(listPromises).then(resolve).catch(reject);
          },
          (_, error) => {
            console.error('Error getting user lists:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const addRestaurantToList = async (listId: string, restaurantId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR IGNORE INTO listItems (listId, restaurantId) VALUES (?, ?);`,
          [listId, restaurantId],
          () => resolve(),
          (_, error) => {
            console.error('Error adding restaurant to list:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const removeRestaurantFromList = async (listId: string, restaurantId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM listItems WHERE listId = ? AND restaurantId = ?;`,
          [listId, restaurantId],
          () => resolve(),
          (_, error) => {
            console.error('Error removing restaurant from list:', error);
            reject(error);
          }
        );
      }
    );
  });
};
