import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';

interface UserPattern {
  activeTimes: string[];
  ignoredTimes: string[];
  preferredCategories: string[];
  dailyMoments: number;
  lastEngagement: Date | null;
}

interface OptimalWindow {
  start: Date;
  end: Date;
  category: string;
  priority: number;
}

interface EngagementData {
  notificationId: string;
  wasIgnored: boolean;
  timestamp: Date;
}

export class TimingEngine {
  private db: any;
  private userId: string;
  private MAX_MOMENTS_PER_DAY = 3;
  private MIN_HOURS_BETWEEN_MOMENTS = 2;

  constructor(userId: string) {
    this.db = useDatabase();
    this.userId = userId;
  }

  async getUserPatterns(): Promise<UserPattern> {
    const patterns = await this.db.getUserPatterns(this.userId);
    return patterns || {
      activeTimes: [],
      ignoredTimes: [],
      preferredCategories: ['Calm', 'Focus', 'Energy'],
      dailyMoments: 0,
      lastEngagement: null
    };
  }

  async updateUserPatterns(engagementData: EngagementData): Promise<void> {
    const patterns = await this.getUserPatterns();
    const hour = engagementData.timestamp.getHours();

    if (engagementData.wasIgnored) {
      // Add to ignored times if not already present
      if (!patterns.ignoredTimes.includes(`${hour}:00`)) {
        patterns.ignoredTimes.push(`${hour}:00`);
      }
    } else {
      // Add to active times if not already present
      if (!patterns.activeTimes.includes(`${hour}:00`)) {
        patterns.activeTimes.push(`${hour}:00`);
      }

      // Update last engagement time
      patterns.lastEngagement = engagementData.timestamp;

      // Increment daily moments counter
      patterns.dailyMoments += 1;
    }

    await this.db.updateUserPatterns(this.userId, patterns);
  }

  async calculateOptimalWindows(settings: any): Promise<OptimalWindow[]> {
    const patterns = await this.getUserPatterns();
    const now = new Date();
    const currentHour = now.getHours();
    const windows: OptimalWindow[] = [];

    // Reset daily moments counter if it's a new day
    if (patterns.lastEngagement && patterns.lastEngagement.getDate() !== now.getDate()) {
      patterns.dailyMoments = 0;
      await this.db.updateUserPatterns(this.userId, patterns);
    }

    // Determine how many moments to schedule today
    const momentsToSchedule = Math.min(
      this.MAX_MOMENTS_PER_DAY,
      Math.max(1, Math.floor(patterns.dailyMoments * 0.7)) // Schedule 70% of previous day's moments
    );

    // Get available time slots
    const availableSlots = this.getAvailableTimeSlots(
      currentHour,
      patterns.ignoredTimes,
      patterns.activeTimes,
      settings.quietHours,
      momentsToSchedule
    );

    // Select categories based on user preferences and diversity
    const categories = this.selectCategories(patterns.preferredCategories);

    // Create optimal windows
    availableSlots.forEach((slot, index) => {
      const windowStart = new Date(now);
      windowStart.setHours(slot.start, 0, 0, 0);

      const windowEnd = new Date(now);
      windowEnd.setHours(slot.end, 0, 0, 0);

      windows.push({
        start: windowStart,
        end: windowEnd,
        category: categories[index % categories.length],
        priority: this.calculatePriority(slot.start, patterns.activeTimes)
      });
    });

    return windows.sort((a, b) => b.priority - a.priority);
  }

  private getAvailableTimeSlots(
    currentHour: number,
    ignoredTimes: string[],
    activeTimes: string[],
    quietHours: { start: number, end: number },
    requiredSlots: number
  ): { start: number, end: number }[] {
    const slots: { start: number, end: number }[] = [];
    let nextSlot = currentHour + this.MIN_HOURS_BETWEEN_MOMENTS;

    // First try to find slots in active times
    const activeHours = activeTimes.map(time => parseInt(time.split(':')[0]));
    for (const hour of activeHours) {
      if (slots.length >= requiredSlots) break;

      if (
        hour > currentHour &&
        !this.isInQuietHours(hour, quietHours) &&
        !this.isIgnoredTime(hour, ignoredTimes)
      ) {
        slots.push({ start: hour, end: hour + 1 });
      }
    }

    // If we don't have enough slots, fill with other available times
    while (slots.length < requiredSlots && nextSlot < 22) {
      if (
        !this.isInQuietHours(nextSlot, quietHours) &&
        !this.isIgnoredTime(nextSlot, ignoredTimes)
      ) {
        slots.push({ start: nextSlot, end: nextSlot + 1 });
        nextSlot += this.MIN_HOURS_BETWEEN_MOMENTS;
      } else {
        nextSlot += 1;
      }
    }

    return slots.slice(0, requiredSlots);
  }

  private selectCategories(preferredCategories: string[]): string[] {
    const allCategories = ['Calm', 'Focus', 'Energy', 'Perspective', 'Gratitude'];
    const categories = [...preferredCategories];

    // Add some variety if we have preferred categories
    if (categories.length > 0) {
      const additionalCategories = allCategories.filter(
        cat => !categories.includes(cat)
      );

      // Add 2-3 additional categories to create variety
      for (let i = 0; i < Math.min(3, additionalCategories.length); i++) {
        categories.push(additionalCategories[i]);
      }
    }

    return categories.length > 0 ? categories : allCategories;
  }

  private calculatePriority(hour: number, activeTimes: string[]): number {
    let priority = 0;

    // Higher priority for active times
    if (activeTimes.some(time => parseInt(time.split(':')[0]) === hour)) {
      priority += 2;
    }

    // Higher priority for morning and evening
    if (hour >= 7 && hour < 12) { // Morning
      priority += 1;
    } else if (hour >= 18 && hour < 22) { // Evening
      priority += 1;
    }

    return priority;
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
    const engagementData: EngagementData = {
      notificationId,
      wasIgnored,
      timestamp: new Date()
    };

    await this.updateUserPatterns(engagementData);
  }

  async getDailySchedule(): Promise<{ moment: Moment, window: OptimalWindow }[]> {
    return await this.db.getScheduledMoments(this.userId);
  }
}
