import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';

export class MomentsService {
  private db: any;

  constructor() {
    const { db } = useDatabase();
    this.db = db;
  }

  async getAllMoments(): Promise<Moment[]> {
    return await this.db.getAllMoments();
  }

  async getRandomMoment(category?: string): Promise<Moment | null> {
    return await this.db.getRandomMoment(category);
  }

  async completeMoment(momentId: string, moodRating?: number): Promise<void> {
    await this.db.completeMoment(momentId, moodRating);
  }

  async getTodayMoments(userId: string): Promise<Moment[]> {
    // Get moments scheduled for today
    const scheduledMoments = await this.db.getScheduledMomentsForToday(userId);

    if (scheduledMoments.length > 0) {
      return scheduledMoments;
    }

    // If no scheduled moments, get random moments based on user preferences
    const userSettings = await this.db.getUserSettings(userId);
    const preferredCategories = userSettings.preferredCategories;

    const moments: Moment[] = [];
    for (const category of preferredCategories) {
      const moment = await this.getRandomMoment(category);
      if (moment) {
        moments.push(moment);
      }
    }

    // If we don't have enough moments, fill with any category
    while (moments.length < 3) {
      const moment = await this.getRandomMoment();
      if (moment && !moments.some(m => m.id === moment.id)) {
        moments.push(moment);
      }
    }

    return moments.slice(0, 3);
  }

  async scheduleMomentsForToday(userId: string): Promise<void> {
    // Get optimal windows from timing engine
    const timingEngine = new TimingEngine(userId);
    const userSettings = await this.db.getUserSettings(userId);
    const optimalWindows = await timingEngine.calculateOptimalWindows(userSettings);

    // Clear existing scheduled moments for today
    await this.db.clearScheduledMomentsForToday(userId);

    // Schedule moments in optimal windows
    for (const window of optimalWindows) {
      const moment = await this.getRandomMoment(window.category);
      if (moment) {
        await this.db.scheduleMomentForToday(userId, moment.id, window.start);
      }
    }
  }
}
