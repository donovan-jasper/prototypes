import * as SQLite from 'expo-sqlite';
import { useAppsStore } from '../../store/apps';
import { usePredictionsStore } from '../../store/predictions';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

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
  icon: string;
}

const db = SQLite.openDatabase('flowhome.db');

const BACKGROUND_TASK_NAME = 'update-smart-collections';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    await generateSmartCollections();
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 60 * 24, // Daily
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
};

export const generateSmartCollections = async (): Promise<SmartCollection[]> => {
  // 1. Query last 30 days of app usage data
  const usageData = await queryUsageData();

  if (usageData.length === 0) {
    return createDefaultCollections();
  }

  // 2. Group apps by time-of-day clusters
  const timePatterns = analyzeTimePatterns(usageData);

  // 3. Identify frequently co-used apps
  const coUsagePatterns = analyzeCoUsagePatterns(usageData);

  // 4. Create collections
  const collections = createCollections(timePatterns, coUsagePatterns);

  // 5. Store collections in SQLite
  await storeCollections(collections);

  // 6. Update Zustand store
  usePredictionsStore.getState().setSmartCollections(collections);

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

  // Simple k-means clustering simulation
  const timeClusters = {
    morning: { start: 6, end: 9 },
    work: { start: 9, end: 17 },
    evening: { start: 17, end: 22 },
    night: { start: 22, end: 6 }
  };

  usageData.forEach(item => {
    const date = new Date(item.timestamp);
    const hour = date.getHours();

    let timeOfDay: keyof typeof patterns;

    if (hour >= timeClusters.morning.start && hour < timeClusters.morning.end) {
      timeOfDay = 'morning';
    } else if (hour >= timeClusters.work.start && hour < timeClusters.work.end) {
      timeOfDay = 'work';
    } else if (hour >= timeClusters.evening.start && hour < timeClusters.evening.end) {
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
  const coUsageCounts: Record<string, number> = {};

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
        coUsageCounts[key] = 1;
      } else {
        coUsageCounts[key]++;
      }
    }
  }

  // Filter patterns that occur at least 3 times
  const frequentPatterns: Record<string, string[]> = {};
  Object.entries(coUsageCounts).forEach(([key, count]) => {
    if (count >= 3) {
      frequentPatterns[key] = coUsageMap[key];
    }
  });

  return frequentPatterns;
};

const createCollections = (
  timePatterns: Record<string, UsagePattern>,
  coUsagePatterns: Record<string, string[]>
): SmartCollection[] => {
  const collections: SmartCollection[] = [];
  const appStore = useAppsStore.getState();

  // Create time-based collections
  Object.entries(timePatterns).forEach(([key, pattern]) => {
    if (pattern.apps.length === 0) return;

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
      lastUpdated: new Date(),
      icon: icon
    });
  });

  // Create co-usage collections
  Object.entries(coUsagePatterns).forEach(([key, apps]) => {
    const appNames = apps.map(pkg => {
      const app = appStore.apps.find(a => a.packageName === pkg);
      return app ? app.name : pkg;
    });

    collections.push({
      id: `co-usage-${key}`,
      name: `Used with ${appNames.join(' & ')}`,
      apps: apps,
      lastUpdated: new Date(),
      icon: '🔗'
    });
  });

  // Add "Recently Used" collection
  const recentApps = [...new Set(usageData.slice(0, 10).map(item => item.package_name))];
  if (recentApps.length > 0) {
    collections.unshift({
      id: 'recently-used',
      name: '🕒 Recently Used',
      apps: recentApps,
      lastUpdated: new Date(),
      icon: '🕒'
    });
  }

  return collections;
};

const createDefaultCollections = (): SmartCollection[] => {
  const appStore = useAppsStore.getState();
  const allApps = appStore.apps;

  // Group apps by category (simplified)
  const categories = {
    productivity: ['com.google.android.apps.docs', 'com.microsoft.office.outlook', 'com.dropbox.android'],
    social: ['com.facebook.katana', 'com.instagram.android', 'com.whatsapp'],
    entertainment: ['com.netflix.mediaclient', 'com.spotify.music', 'com.disney.disneyplus'],
    utilities: ['com.android.chrome', 'com.google.android.gm', 'com.google.android.calendar']
  };

  return [
    {
      id: 'default-productivity',
      name: '💼 Productivity',
      apps: allApps.filter(app => categories.productivity.includes(app.packageName)).map(app => app.packageName),
      lastUpdated: new Date(),
      icon: '💼'
    },
    {
      id: 'default-social',
      name: '💬 Social',
      apps: allApps.filter(app => categories.social.includes(app.packageName)).map(app => app.packageName),
      lastUpdated: new Date(),
      icon: '💬'
    },
    {
      id: 'default-entertainment',
      name: '🎬 Entertainment',
      apps: allApps.filter(app => categories.entertainment.includes(app.packageName)).map(app => app.packageName),
      lastUpdated: new Date(),
      icon: '🎬'
    },
    {
      id: 'default-utilities',
      name: '🛠️ Utilities',
      apps: allApps.filter(app => categories.utilities.includes(app.packageName)).map(app => app.packageName),
      lastUpdated: new Date(),
      icon: '🛠️'
    }
  ];
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
          (_, error) => console.error('Error inserting collection:', error)
        );
      });

      resolve();
    }, (error) => reject(error));
  });
};

export const loadCollectionsFromDB = async (): Promise<SmartCollection[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM smart_collections',
        [],
        (_, { rows }) => {
          const collections: SmartCollection[] = rows._array.map(row => ({
            id: row.id,
            name: row.name,
            apps: JSON.parse(row.app_packages),
            lastUpdated: new Date(row.last_updated),
            icon: row.name.split(' ')[0] // Extract emoji from name
          }));
          resolve(collections);
        },
        (_, error) => reject(error)
      );
    });
  });
};
