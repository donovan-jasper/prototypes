import { InsightsEngine } from '../lib/analytics/insightsEngine';
import { Session } from '../lib/session/sessionManager';

describe('Insights Engine', () => {
  test('identifies optimal rest time from session data', () => {
    const sessions: Session[] = [
      {
        id: '1',
        durationMinutes: 15,
        startTime: new Date('2024-01-01T14:00:00').getTime(),
        status: 'completed',
        energyRating: 5,
      },
      {
        id: '2',
        durationMinutes: 15,
        startTime: new Date('2024-01-02T14:30:00').getTime(),
        status: 'completed',
        energyRating: 5,
      },
      {
        id: '3',
        durationMinutes: 15,
        startTime: new Date('2024-01-03T16:00:00').getTime(),
        status: 'completed',
        energyRating: 3,
      },
      {
        id: '4',
        durationMinutes: 15,
        startTime: new Date('2024-01-04T10:00:00').getTime(),
        status: 'completed',
        energyRating: 4,
      },
    ];
    const engine = new InsightsEngine();
    const optimal = engine.findOptimalRestTime(sessions);
    expect(optimal?.hour).toBe(14);
    expect(optimal?.averageRating).toBe(5);
  });

  test('calculates completion rate', () => {
    const sessions: Session[] = [
      {
        id: '1',
        durationMinutes: 15,
        startTime: Date.now(),
        status: 'completed',
      },
      {
        id: '2',
        durationMinutes: 15,
        startTime: Date.now(),
        status: 'completed',
      },
      {
        id: '3',
        durationMinutes: 15,
        startTime: Date.now(),
        status: 'interrupted',
      },
      {
        id: '4',
        durationMinutes: 15,
        startTime: Date.now(),
        status: 'completed',
      },
    ];
    const engine = new InsightsEngine();
    const rate = engine.calculateCompletionRate(sessions);
    expect(rate).toBe(0.75);
  });

  test('returns null for optimal time with no sessions', () => {
    const engine = new InsightsEngine();
    const optimal = engine.findOptimalRestTime([]);
    expect(optimal).toBeNull();
  });

  test('returns 0 completion rate with no sessions', () => {
    const engine = new InsightsEngine();
    const rate = engine.calculateCompletionRate([]);
    expect(rate).toBe(0);
  });

  test('generates insights for sufficient data', () => {
    const sessions: Session[] = [
      {
        id: '1',
        durationMinutes: 15,
        startTime: new Date('2024-01-01T14:00:00').getTime(),
        status: 'completed',
        energyRating: 5,
      },
      {
        id: '2',
        durationMinutes: 15,
        startTime: new Date('2024-01-02T14:30:00').getTime(),
        status: 'completed',
        energyRating: 4,
      },
      {
        id: '3',
        durationMinutes: 15,
        startTime: new Date('2024-01-03T14:00:00').getTime(),
        status: 'completed',
        energyRating: 5,
      },
    ];
    const engine = new InsightsEngine();
    const insights = engine.generateInsights(sessions);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toContain('best rest time');
  });

  test('returns placeholder message for insufficient data', () => {
    const sessions: Session[] = [
      {
        id: '1',
        durationMinutes: 15,
        startTime: Date.now(),
        status: 'completed',
        energyRating: 4,
      },
    ];
    const engine = new InsightsEngine();
    const insights = engine.generateInsights(sessions);
    expect(insights).toEqual([
      'Complete more sessions to unlock personalized insights',
    ]);
  });

  test('handles sessions without energy ratings', () => {
    const sessions: Session[] = [
      {
        id: '1',
        durationMinutes: 15,
        startTime: new Date('2024-01-01T14:00:00').getTime(),
        status: 'completed',
      },
      {
        id: '2',
        durationMinutes: 15,
        startTime: new Date('2024-01-02T14:30:00').getTime(),
        status: 'completed',
        energyRating: 5,
      },
      {
        id: '3',
        durationMinutes: 15,
        startTime: new Date('2024-01-03T14:00:00').getTime(),
        status: 'completed',
      },
    ];
    const engine = new InsightsEngine();
    const optimal = engine.findOptimalRestTime(sessions);
    expect(optimal?.sessionCount).toBe(1);
  });
});
