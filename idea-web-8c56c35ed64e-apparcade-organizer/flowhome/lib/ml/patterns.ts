import { getAppUsage } from '../database';

export const detectPatterns = async () => {
  getAppUsage((usage) => {
    const patterns: { [key: string]: string[] } = {
      morning: [],
      work: [],
      evening: [],
      weekend: [],
    };

    usage.forEach((item) => {
      const hour = new Date(item.timestamp).getHours();
      const dayOfWeek = new Date(item.timestamp).getDay();

      if (hour >= 6 && hour < 9) {
        patterns.morning.push(item.package_name);
      } else if (hour >= 9 && hour < 17) {
        patterns.work.push(item.package_name);
      } else if (hour >= 17 && hour < 22) {
        patterns.evening.push(item.package_name);
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        patterns.weekend.push(item.package_name);
      }
    });

    return patterns;
  });
};
