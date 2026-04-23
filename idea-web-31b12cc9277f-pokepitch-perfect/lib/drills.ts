import { Drill, DrillResult, Target, UserInput } from './types';

export function generateAimTargets(count: number, area: { width: number, height: number }, difficulty: number): Target[] {
  const targets: Target[] = [];
  const minDistance = 80;
  const maxAttempts = 100;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let newTarget: Target;

    do {
      const size = TARGET_SIZE * (0.8 + difficulty * 0.4); // Size increases with difficulty
      const x = Math.random() * (area.width - size);
      const y = Math.random() * (area.height - size);

      newTarget = {
        id: `target-${Date.now()}-${i}`,
        x,
        y,
        size,
        timestamp: Date.now(),
      };

      attempts++;
      if (attempts >= maxAttempts) break;
    } while (targets.some(target => distanceBetweenTargets(target, newTarget) < minDistance));

    targets.push(newTarget);
  }

  return targets;
}

function distanceBetweenTargets(a: Target, b: Target): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateScore(targets: Target[], inputs: UserInput[], timeLeft: number): {
  total: number;
  accuracy: number;
  reactionTime: number;
  consistency: number;
} {
  if (targets.length === 0 || inputs.length === 0) {
    return {
      total: 0,
      accuracy: 0,
      reactionTime: 0,
      consistency: 0,
    };
  }

  const totalTargets = targets.length;
  const hits = inputs.filter(input => input.isHit).length;
  const misses = inputs.filter(input => !input.isHit).length;

  // Calculate accuracy (percentage of targets hit)
  const accuracy = (hits / totalTargets) * 100;

  // Calculate average reaction time for hits
  const hitReactionTimes = inputs
    .filter(input => input.isHit && input.reactionTime)
    .map(input => input.reactionTime!);

  const avgReactionTime = hitReactionTimes.length > 0
    ? hitReactionTimes.reduce((sum, time) => sum + time, 0) / hitReactionTimes.length
    : 0;

  // Calculate consistency (standard deviation of reaction times)
  let consistency = 0;
  if (hitReactionTimes.length > 1) {
    const mean = avgReactionTime;
    const squaredDiffs = hitReactionTimes.map(time => Math.pow(time - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
    consistency = 100 - Math.sqrt(variance); // Higher is better
  } else {
    consistency = 100; // Perfect consistency with single hit
  }

  // Calculate total score (weighted combination of metrics)
  const total = Math.round(
    (accuracy * 0.5) +
    ((100 - avgReactionTime / 10) * 0.3) + // Faster is better (capped at 1000ms)
    (consistency * 0.2)
  );

  return {
    total: Math.min(Math.max(total, 0), 100), // Ensure score is between 0-100
    accuracy: Math.round(accuracy),
    reactionTime: Math.round(avgReactionTime),
    consistency: Math.round(consistency),
  };
}

export function validateDrillCompletion(drill: Drill, result: DrillResult): boolean {
  // Basic validation - in a real app would have more complex rules
  return result.score >= 0 && result.score <= 100;
}

const TARGET_SIZE = 60;
