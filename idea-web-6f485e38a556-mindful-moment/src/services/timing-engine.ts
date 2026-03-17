import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';

interface UserPattern {
  activeTimes: string[];
  ignoredTimes: string[];
  preferredCategories: string[];
}

interface OptimalWindow {
  start: Date;
  end: Date;
  category: string;
}

export class TimingEngine {
  private db: any;
  private userId: string;

  constructor(userId: string) {
    this.db = useDatabase();
    this.userId = userId;
  }

  async getUserPatterns(): Promise<UserPattern> {
    // Get user's historical patterns from database
    const patterns = await this.db.getUserPatterns(this.userId);
    return patterns || {
      activeTimes: [],
      ignoredTimes: [],
      preferredCategories: ['Calm', 'Focus', 'Energy']
    };
  }

  calculateOptimalWindows(patterns: UserPattern, settings: any): OptimalWindow[] {
    const now = new Date();
    const currentHour = now.getHours();
    const windows: OptimalWindow[] = [];

    // Determine time slots based on user patterns
    const availableSlots = this.getAvailableTimeSlots(currentHour, patterns.ignoredTimes, settings.quietHours);

    // Select categories based on user preferences and diversity
    const categories = this.selectCategories(patterns.preferredCategories);

    // Create optimal windows
    availableSlots.forEach((slot, index) => {
      windows.push({
        start: new Date(now.setHours(slot.start, 0, 0, 0)),
        end: new Date(now.setHours(slot.end, 0, 0, 0)),
        category: categories[index % categories.length]
      });
    });

    return windows;
  }

  private getAvailableTimeSlots(currentHour: number, ignoredTimes: string[], quietHours: { start: number, end: number }): { start: number, end: number }[] {
    // Implement logic to find optimal time slots based on:
    // - Current time
    // - Times user typically ignores notifications
    // - Quiet hours
    // - User's active times

    // For MVP, use simple logic that spaces moments 2-3 hours apart
    const slots = [];
    let nextSlot = currentHour + 2;

    while (nextSlot < 22) { // Don't schedule after 10pm
      if (!this.isInQuietHours(nextSlot, quietHours) && !this.isIgnoredTime(nextSlot, ignoredTimes)) {
        slots.push({ start: nextSlot, end: nextSlot + 1 });
        nextSlot += 3; // Space next moment 3 hours later
      } else {
        nextSlot += 1;
      }
    }

    return slots;
  }

  private selectCategories(preferredCategories: string[]): string[] {
    // Implement logic to select diverse categories based on:
    // - User preferences
    // - Recent moment history
    // - Seasonal/holiday themes

    // For MVP, rotate through preferred categories
    return preferredCategories.length > 0 ? preferredCategories : ['Calm', 'Focus', 'Energy'];
  }

  private isInQuietHours(hour: number, quietHours: { start: number, end: number }): boolean {
    if (quietHours.start < quietHours.end) {
      return hour >= quietHours.start && hour < quietHours.end;
    } else {
      return hour >= quietHours.start || hour < quietHours.end;
    }
  }

  private isIgnoredTime(hour: number, ignoredTimes: string[]): boolean {
    return ignoredTimes.some(time => {
      const ignoredHour = parseInt(time.split(':')[0]);
      return Math.abs(ignoredHour - hour) <= 1; // Within 1 hour of ignored time
    });
  }

  async scheduleMoments(moments: Moment[], windows: OptimalWindow[]): Promise<void> {
    // Schedule moments in the database for delivery
    await this.db.scheduleMoments(this.userId, moments, windows);
  }

  async adaptToUserBehavior(notificationId: string, wasIgnored: boolean): Promise<void> {
    // Update user patterns based on notification interaction
    if (wasIgnored) {
      await this.db.logIgnoredNotification(this.userId, notificationId);
    } else {
      await this.db.logEngagedNotification(this.userId, notificationId);
    }
  }
}
