import * as SQLite from 'expo-sqlite';
import { useAppsStore } from '../../store/apps';

interface UsagePattern {
  timeOfDay: 'morning' | 'work' | 'evening' | 'night';
  apps: string[];
  coUsedApps: string[];
}

interface SmartCollection {
  id: string;
  name: string;
  apps: string[];
  lastUpdated: Date;
}

const db = SQLite.openDatabase('flowhome.db');

export const generateSmartCollections = async (): Promise<SmartCollection[]> => {
  // 1. Query last 30 days of app usage data
  const usageData = await queryUsageData();

  // 2. Group apps by time-of-day clusters
  const timePatterns = analyzeTimePatterns(usageData);

  // 3. Identify frequently co-used apps
  const coUsagePatterns = analyzeCoUsagePatterns(usageData);

  // 4. Create collections
  const collections = createCollections(timePatterns, coUsagePatterns);

  // 5. Store collections in SQLite
  await storeCollections(collections);

  return collections;
};

const queryUsageData = async (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT package_name, timestamp, duration
         FROM app_usage
         WHERE timestamp > datetime('now', '-30 days')
         ORDER BY timestamp DESC`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const analyzeTimePatterns = (usageData: any[]): Record<string, UsagePattern> => {
  const patterns: Record<string, UsagePattern> = {
    morning: { timeOfDay: 'morning', apps: [], coUsedApps: [] },
    work: { timeOfDay: 'work', apps: [], coUsedApps: [] },
    evening: { timeOfDay: 'evening', apps: [], coUsedApps: [] },
    night: { timeOfDay: 'night', apps: [], coUsedApps: [] }
  };

  usageData.forEach(item => {
    const date = new Date(item.timestamp);
    const hour = date.getHours();

    let timeOfDay: keyof typeof patterns;

    if (hour >= 6 && hour < 9) {
      timeOfDay = 'morning';
    } else if (hour >= 9 && hour < 17) {
      timeOfDay = 'work';
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    if (!patterns[timeOfDay].apps.includes(item.package_name)) {
      patterns[timeOfDay].apps.push(item.package_name);
    }
  });

  return patterns;
};

const analyzeCoUsagePatterns = (usageData: any[]): Record<string, string[]> => {
  const coUsageMap: Record<string, string[]> = {};

  // Sort usage data by timestamp
  const sortedData = [...usageData].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Find apps used within 5 minutes of each other
  for (let i = 0; i < sortedData.length - 1; i++) {
    const current = sortedData[i];
    const next = sortedData[i + 1];

    const currentTime = new Date(current.timestamp).getTime();
    const nextTime = new Date(next.timestamp).getTime();

    // If within 5 minutes
    if (nextTime - currentTime <= 5 * 60 * 1000) {
      const key = `${current.package_name}-${next.package_name}`;

      if (!coUsageMap[key]) {
        coUsageMap[key] = [current.package_name, next.package_name];
      }
    }
  }

  return coUsageMap;
};

const createCollections = (
  timePatterns: Record<string, UsagePattern>,
  coUsagePatterns: Record<string, string[]>
): SmartCollection[] => {
  const collections: SmartCollection[] = [];

  // Create time-based collections
  Object.entries(timePatterns).forEach(([key, pattern]) => {
    let name: string;
    let icon: string;

    switch (key) {
      case 'morning':
        name = 'Morning Routine';
        icon = '🌅';
        break;
      case 'work':
        name = 'Work';
        icon = '💼';
        break;
      case 'evening':
        name = 'Evening Wind-down';
        icon = '🌙';
        break;
      default:
        name = 'Night';
        icon = '🌑';
    }

    collections.push({
      id: `${key}-collection`,
      name: `${icon} ${name}`,
      apps: pattern.apps,
      lastUpdated: new Date()
    });
  });

  // Create co-usage collections
  Object.entries(coUsagePatterns).forEach(([key, apps]) => {
    const appNames = apps.map(pkg => {
      const appStore = useAppsStore.getState();
      const app = appStore.apps.find(a => a.packageName === pkg);
      return app ? app.name : pkg;
    });

    collections.push({
      id: `co-usage-${key}`,
      name: `Used with ${appNames.join(' & ')}`,
      apps: apps,
      lastUpdated: new Date()
    });
  });

  return collections;
};

const storeCollections = async (collections: SmartCollection[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Clear existing collections
      tx.executeSql('DELETE FROM smart_collections');

      // Insert new collections
      collections.forEach(collection => {
        tx.executeSql(
          'INSERT INTO smart_collections (id, name, app_packages, last_updated) VALUES (?, ?, ?, ?)',
          [
            collection.id,
            collection.name,
            JSON.stringify(collection.apps),
            collection.lastUpdated.toISOString()
          ],
          () => {},
          (_, error) => reject(error)
        );
      });

      resolve();
    });
  });
};

export const getSmartCollections = async (): Promise<SmartCollection[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM smart_collections ORDER BY last_updated DESC',
        [],
        (_, { rows }) => {
          const collections = rows._array.map(row => ({
            id: row.id,
            name: row.name,
            apps: JSON.parse(row.app_packages),
            lastUpdated: new Date(row.last_updated)
          }));
          resolve(collections);
        },
        (_, error) => reject(error)
      );
    });
  });
};
