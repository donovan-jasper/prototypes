import * as SQLite from 'expo-sqlite';
import { Restaurant, Inspection, UserList } from '@/types';

const db = SQLite.openDatabase('safebite.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
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
      error => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const cacheRestaurants = async (restaurants: Restaurant[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        restaurants.forEach(restaurant => {
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
              new Date().toISOString()
            ]
          );
        });
      },
      error => {
        console.error('Failed to cache restaurants:', error);
        reject(error);
      },
      () => {
        console.log(`Cached ${restaurants.length} restaurants`);
        resolve(true);
      }
    );
  });
};

export const getCachedRestaurants = async (): Promise<Restaurant[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM restaurants ORDER BY cachedAt DESC LIMIT 50;`,
          [],
          (_, { rows }) => {
            const restaurants: Restaurant[] = [];
            for (let i = 0; i < rows.length; i++) {
              restaurants.push(rows.item(i) as Restaurant);
            }
            resolve(restaurants);
          }
        );
      },
      error => {
        console.error('Failed to get cached restaurants:', error);
        reject(error);
      }
    );
  });
};

export const cacheInspections = async (inspections: Inspection[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        inspections.forEach(inspection => {
          // Insert inspection
          tx.executeSql(
            `INSERT OR REPLACE INTO inspections (id, restaurantId, date, score) VALUES (?, ?, ?, ?);`,
            [inspection.id, inspection.restaurantId, inspection.date, inspection.score]
          );

          // Insert violations
          inspection.violations.forEach(violation => {
            tx.executeSql(
              `INSERT OR REPLACE INTO violations (id, inspectionId, description, severity) VALUES (?, ?, ?, ?);`,
              [violation.id, inspection.id, violation.description, violation.severity]
            );
          });
        });
      },
      error => {
        console.error('Failed to cache inspections:', error);
        reject(error);
      },
      () => {
        console.log(`Cached ${inspections.length} inspections`);
        resolve(true);
      }
    );
  });
};

export const getCachedInspections = async (restaurantId: string): Promise<Inspection[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
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
            const inspectionPromises = inspections.map(inspection => {
              return new Promise<Inspection>((resolveInspection) => {
                tx.executeSql(
                  `SELECT * FROM violations WHERE inspectionId = ?;`,
                  [inspection.id],
                  (_, { rows }) => {
                    const violations = [];
                    for (let j = 0; j < rows.length; j++) {
                      violations.push(rows.item(j));
                    }
                    resolveInspection({ ...inspection, violations });
                  }
                );
              });
            });

            Promise.all(inspectionPromises).then(resolvedInspections => {
              resolve(resolvedInspections);
            });
          }
        );
      },
      error => {
        console.error('Failed to get cached inspections:', error);
        reject(error);
      }
    );
  });
};

export const clearOldCache = async (days: number = 7) => {
  return new Promise((resolve, reject) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    db.transaction(
      tx => {
        // Delete old restaurants
        tx.executeSql(
          `DELETE FROM restaurants WHERE cachedAt < ?;`,
          [cutoffDate.toISOString()]
        );

        // Delete inspections for deleted restaurants
        tx.executeSql(
          `DELETE FROM inspections WHERE restaurantId NOT IN (SELECT id FROM restaurants);`
        );

        // Delete violations for deleted inspections
        tx.executeSql(
          `DELETE FROM violations WHERE inspectionId NOT IN (SELECT id FROM inspections);`
        );
      },
      error => {
        console.error('Failed to clear old cache:', error);
        reject(error);
      },
      () => {
        console.log('Cleared old cache entries');
        resolve(true);
      }
    );
  });
};

export const saveUserList = async (list: UserList) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Insert or replace the list
        tx.executeSql(
          `INSERT OR REPLACE INTO userLists (id, name, createdAt) VALUES (?, ?, ?);`,
          [list.id, list.name, list.createdAt]
        );

        // Delete existing list items
        tx.executeSql(
          `DELETE FROM listItems WHERE listId = ?;`,
          [list.id]
        );

        // Insert new list items
        list.restaurantIds.forEach(restaurantId => {
          tx.executeSql(
            `INSERT INTO listItems (listId, restaurantId) VALUES (?, ?);`,
            [list.id, restaurantId]
          );
        });
      },
      error => {
        console.error('Failed to save user list:', error);
        reject(error);
      },
      () => {
        console.log('User list saved successfully');
        resolve(true);
      }
    );
  });
};

export const getUserLists = async (): Promise<UserList[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
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
            const listPromises = lists.map(list => {
              return new Promise<UserList>((resolveList) => {
                tx.executeSql(
                  `SELECT restaurantId FROM listItems WHERE listId = ?;`,
                  [list.id],
                  (_, { rows }) => {
                    const restaurantIds = [];
                    for (let j = 0; j < rows.length; j++) {
                      restaurantIds.push(rows.item(j).restaurantId);
                    }
                    resolveList({ ...list, restaurantIds });
                  }
                );
              });
            });

            Promise.all(listPromises).then(resolvedLists => {
              resolve(resolvedLists);
            });
          }
        );
      },
      error => {
        console.error('Failed to get user lists:', error);
        reject(error);
      }
    );
  });
};

export const deleteUserList = async (listId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Delete the list
        tx.executeSql(
          `DELETE FROM userLists WHERE id = ?;`,
          [listId]
        );

        // Delete list items
        tx.executeSql(
          `DELETE FROM listItems WHERE listId = ?;`,
          [listId]
        );
      },
      error => {
        console.error('Failed to delete user list:', error);
        reject(error);
      },
      () => {
        console.log('User list deleted successfully');
        resolve(true);
      }
    );
  });
};
