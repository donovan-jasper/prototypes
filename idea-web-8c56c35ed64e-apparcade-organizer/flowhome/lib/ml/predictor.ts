import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowhome.db');

interface AppUsageCount {
  package_name: string;
  count: number;
}

export const getTopAppsByContext = (
  hour: number,
  dayOfWeek: number,
  location: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT package_name, COUNT(*) as count 
         FROM app_usage 
         WHERE context_time = ? AND context_location = ?
         GROUP BY package_name 
         ORDER BY count DESC 
         LIMIT 8;`,
        [getTimeContext(hour), location],
        (_, { rows }) => {
          const results = rows._array as AppUsageCount[];
          resolve(results.map((row) => row.package_name));
        },
        (_, error) => {
          console.error('Error querying top apps by context:', error);
          resolve([]);
          return false;
        }
      );
    });
  });
};

export const getGlobalTopApps = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT package_name, COUNT(*) as count 
         FROM app_usage 
         WHERE timestamp >= ?
         GROUP BY package_name 
         ORDER BY count DESC 
         LIMIT 8;`,
        [sevenDaysAgo],
        (_, { rows }) => {
          const results = rows._array as AppUsageCount[];
          resolve(results.map((row) => row.package_name));
        },
        (_, error) => {
          console.error('Error querying global top apps:', error);
          resolve([]);
          return false;
        }
      );
    });
  });
};

const getTimeContext = (hour: number): string => {
  if (hour >= 6 && hour < 9) {
    return 'morning';
  } else if (hour >= 9 && hour < 17) {
    return 'work';
  } else if (hour >= 17 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
};
