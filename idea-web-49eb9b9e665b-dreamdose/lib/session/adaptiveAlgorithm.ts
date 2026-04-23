/**
 * Adaptive algorithm for cue timing and intensity during rest sessions.
 * Increases cue frequency and intensity as session progresses to prevent deep sleep.
 */

/**
 * Calculate the time until the next cue based on session progress.
 * Early session: 3-5 minutes between cues
 * Late session: 30-60 seconds between cues
 * Uses exponential decay for smooth progression
 */
export function calculateNextCueTime(
  elapsedMinutes: number,
  totalMinutes: number
): number {
  const progress = elapsedMinutes / totalMinutes;

  // Exponential decay from 5 minutes (300s) to 30 seconds
  const maxInterval = 300; // 5 minutes in seconds
  const minInterval = 30; // 30 seconds

  // Use exponential decay: interval = max * e^(-k * progress)
  // Adjusted to reach minInterval at progress = 1
  const k = Math.log(maxInterval / minInterval);
  const interval = maxInterval * Math.exp(-k * progress);

  // Add slight randomization (±10%) to make cues feel more natural
  const randomFactor = 0.9 + Math.random() * 0.2;

  return Math.max(minInterval, Math.floor(interval * randomFactor));
}

/**
 * Calculate cue intensity based on session progress.
 * Early session: 0.3 (subtle)
 * Late session: 1.0 (strong)
 * Linear increase for predictable escalation
 */
export function getCueIntensity(
  elapsedMinutes: number,
  totalMinutes: number
): number {
  const progress = elapsedMinutes / totalMinutes;

  const minIntensity = 0.3;
  const maxIntensity = 1.0;

  // Linear interpolation
  const intensity = minIntensity + (maxIntensity - minIntensity) * progress;

  return Math.min(maxIntensity, Math.max(minIntensity, intensity));
}
