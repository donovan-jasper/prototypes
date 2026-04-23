import { getAppUsage } from '../database';

interface UsagePattern {
  [key: string]: string[];
}

export const detectPatterns = async (): Promise<UsagePattern> => {
  return new Promise((resolve) => {
    getAppUsage((usage) => {
      const patterns: UsagePattern = {
        morning: [],
        work: [],
        evening: [],
        weekend: [],
        commute: [],
        fitness: [],
        social: [],
        entertainment: []
      };

      // Group apps by time patterns
      usage.forEach((item) => {
        const date = new Date(item.timestamp);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Time-based grouping
        if (hour >= 6 && hour < 9) {
          patterns.morning.push(item.package_name);
        } else if (hour >= 9 && hour < 17) {
          patterns.work.push(item.package_name);
        } else if (hour >= 17 && hour < 22) {
          patterns.evening.push(item.package_name);
        } else if (isWeekend) {
          patterns.weekend.push(item.package_name);
        }

        // Context-based grouping
        if (item.context_location === 'commute') {
          patterns.commute.push(item.package_name);
        } else if (item.context_location === 'gym') {
          patterns.fitness.push(item.package_name);
        } else if (item.context_location === 'social') {
          patterns.social.push(item.package_name);
        } else if (item.context_location === 'entertainment') {
          patterns.entertainment.push(item.package_name);
        }
      });

      // Remove duplicates and limit to top 10 apps per pattern
      Object.keys(patterns).forEach(key => {
        patterns[key] = [...new Set(patterns[key])].slice(0, 10);
      });

      resolve(patterns);
    });
  });
};

export const generateSmartCollections = async (): Promise<{ name: string; apps: string[] }[]> => {
  const patterns = await detectPatterns();

  // Map pattern keys to human-readable collection names
  const collectionNames: Record<string, string> = {
    morning: 'Morning Routine',
    work: 'Work',
    evening: 'Evening Wind-down',
    weekend: 'Weekend',
    commute: 'Commute',
    fitness: 'Fitness',
    social: 'Social',
    entertainment: 'Entertainment'
  };

  // Filter out empty collections and format for database
  return Object.entries(patterns)
    .filter(([_, apps]) => apps.length > 0)
    .map(([key, apps]) => ({
      name: collectionNames[key] || key,
      apps: apps
    }));
};
