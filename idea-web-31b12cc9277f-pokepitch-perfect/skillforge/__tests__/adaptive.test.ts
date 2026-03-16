import { shouldLevelUp, adjustDifficulty } from '../lib/adaptive';
import { Drill, DrillResult } from '../lib/types';

describe('shouldLevelUp', () => {
  it('returns true if last 3 scores are 80+', () => {
    const results: DrillResult[] = [
      { drillId: '1', score: { total: 80, accuracy: 80, reactionTime: 100, consistency: 80 }, accuracy: 80, reactionTime: 100, consistency: 80, timestamp: '2023-01-01' },
      { drillId: '1', score: { total: 85, accuracy: 85, reactionTime: 95, consistency: 85 }, accuracy: 85, reactionTime: 95, consistency: 85, timestamp: '2023-01-02' },
      { drillId: '1', score: { total: 90, accuracy: 90, reactionTime: 90, consistency: 90 }, accuracy: 90, reactionTime: 90, consistency: 90, timestamp: '2023-01-03' },
    ];
    expect(shouldLevelUp(results)).toBe(true);
  });

  it('returns false if less than 3 results', () => {
    const results: DrillResult[] = [
      { drillId: '1', score: { total: 80, accuracy: 80, reactionTime: 100, consistency: 80 }, accuracy: 80, reactionTime: 100, consistency: 80, timestamp: '2023-01-01' },
    ];
    expect(shouldLevelUp(results)).toBe(false);
  });
});

describe('adjustDifficulty', () => {
  it('increases difficulty when leveling up', () => {
    const drill: Drill = { id: '1', name: 'Test Drill', description: 'Test', type: 'aim', difficulty: 'Beginner', duration: 30, bestScore: 0 };
    const newDrill = adjustDifficulty(drill, true);
    expect(newDrill.difficulty).toBe('Beginner+1');
    expect(newDrill.duration).toBeLessThan(30);
  });

  it('decreases difficulty when not leveling up', () => {
    const drill: Drill = { id: '1', name: 'Test Drill', description: 'Test', type: 'aim', difficulty: 'Beginner', duration: 30, bestScore: 0 };
    const newDrill = adjustDifficulty(drill, false);
    expect(newDrill.difficulty).toBe('Beginner-1');
    expect(newDrill.duration).toBeGreaterThan(30);
  });
});
