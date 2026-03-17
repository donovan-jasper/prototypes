/**
 * Analytics engine for generating insights from session data.
 * Analyzes patterns in rest sessions to provide actionable recommendations.
 */

import { Session } from '../session/sessionManager';

export interface OptimalRestTime {
  hour: number;
  averageRating: number;
  sessionCount: number;
}

export class InsightsEngine {
  /**
   * Find the hour of day with the highest average energy ratings.
   * Groups completed sessions by hour and calculates average rating.
   */
  findOptimalRestTime(sessions: Session[]): OptimalRestTime | null {
    if (sessions.length === 0) return null;

    const hourData: { [hour: number]: { total: number; count: number } } = {};

    sessions.forEach((session) => {
      if (!session.energyRating || !session.startTime) return;

      const hour = new Date(session.startTime).getHours();
      if (!hourData[hour]) {
        hourData[hour] = { total: 0, count: 0 };
      }
      hourData[hour].total += session.energyRating;
      hourData[hour].count += 1;
    });

    let bestHour: OptimalRestTime | null = null;

    Object.entries(hourData).forEach(([hourStr, data]) => {
      const hour = parseInt(hourStr);
      const averageRating = data.total / data.count;

      if (!bestHour || averageRating > bestHour.averageRating) {
        bestHour = {
          hour,
          averageRating,
          sessionCount: data.count,
        };
      }
    });

    return bestHour;
  }

  /**
   * Calculate the percentage of completed vs interrupted sessions.
   * Returns a value between 0 and 1.
   */
  calculateCompletionRate(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    const completedCount = sessions.filter(
      (s) => s.status === 'completed'
    ).length;

    return completedCount / sessions.length;
  }

  /**
   * Generate human-readable insight strings based on session data.
   * Returns array of insights for display in UI.
   */
  generateInsights(sessions: Session[]): string[] {
    const insights: string[] = [];

    if (sessions.length < 3) {
      return ['Complete more sessions to unlock personalized insights'];
    }

    // Optimal rest time insight
    const optimalTime = this.findOptimalRestTime(sessions);
    if (optimalTime) {
      const hour12 = optimalTime.hour % 12 || 12;
      const period = optimalTime.hour >= 12 ? 'PM' : 'AM';
      insights.push(
        `Your best rest time is ${hour12} ${period} (${optimalTime.averageRating.toFixed(1)}⭐ average)`
      );
    }

    // Completion rate insight
    const completionRate = this.calculateCompletionRate(sessions);
    if (completionRate >= 0.8) {
      insights.push(
        `Great consistency! You complete ${Math.round(completionRate * 100)}% of your sessions`
      );
    } else if (completionRate < 0.5) {
      insights.push(
        `Try shorter sessions to improve your ${Math.round(completionRate * 100)}% completion rate`
      );
    }

    // Average energy rating insight
    const completedSessions = sessions.filter((s) => s.status === 'completed');
    if (completedSessions.length > 0) {
      const avgRating =
        completedSessions.reduce((sum, s) => sum + (s.energyRating || 0), 0) /
        completedSessions.length;

      if (avgRating >= 4) {
        insights.push(
          `Rest sessions are working well for you (${avgRating.toFixed(1)}⭐ average energy)`
        );
      } else if (avgRating < 3) {
        insights.push(
          `Consider adjusting session length to boost your ${avgRating.toFixed(1)}⭐ average energy`
        );
      }
    }

    return insights.slice(0, 3);
  }
}
