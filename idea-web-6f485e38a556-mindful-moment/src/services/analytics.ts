import { useDatabase } from '../hooks/useDatabase';
import { AnalyticsData } from '../types';

export class AnalyticsService {
  private db: any;

  constructor() {
    const { db } = useDatabase();
    this.db = db;
  }

  async logMomentCompletion(momentId: string, moodRating?: number): Promise<void> {
    await this.db.completeMoment(momentId, moodRating);
  }

  async getDailyAnalytics(date: Date): Promise<AnalyticsData | null> {
    return await this.db.getDailyAnalytics(date);
  }

  async getWeeklyAnalytics(): Promise<AnalyticsData[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    return await this.db.getAnalyticsBetweenDates(weekAgo, today);
  }

  async calculateStressPatterns(): Promise<any> {
    const weeklyData = await this.getWeeklyAnalytics();

    // Calculate stress patterns based on:
    // - Time of day with most moments taken
    // - Days with highest moment completion
    // - Notification engagement rates

    const patterns = {
      peakTimes: this.calculatePeakTimes(weeklyData),
      completionRates: this.calculateCompletionRates(weeklyData),
      engagementRate: this.calculateEngagementRate(weeklyData),
    };

    return patterns;
  }

  private calculatePeakTimes(data: AnalyticsData[]): any {
    const timeBuckets = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    data.forEach(day => {
      const date = new Date(day.date);
      const hours = date.getHours();

      if (hours >= 5 && hours < 12) {
        timeBuckets.morning += day.momentsTaken;
      } else if (hours >= 12 && hours < 17) {
        timeBuckets.afternoon += day.momentsTaken;
      } else if (hours >= 17 && hours < 22) {
        timeBuckets.evening += day.momentsTaken;
      } else {
        timeBuckets.night += day.momentsTaken;
      }
    });

    return timeBuckets;
  }

  private calculateCompletionRates(data: AnalyticsData[]): any {
    const completionRates = data.map(day => ({
      date: day.date,
      rate: day.momentsTaken / (day.notificationsSent || 1),
    }));

    return completionRates;
  }

  private calculateEngagementRate(data: AnalyticsData[]): number {
    const totalNotifications = data.reduce((sum, day) => sum + day.notificationsSent, 0);
    const totalEngagements = data.reduce((sum, day) => sum + (day.notificationsSent - day.notificationsIgnored), 0);

    return totalNotifications > 0 ? totalEngagements / totalNotifications : 0;
  }
}
