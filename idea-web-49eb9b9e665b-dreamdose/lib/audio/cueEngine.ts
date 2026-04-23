/**
 * Cue engine for generating and managing intervention schedules during rest sessions.
 * Produces a timeline of audio, haptic, or combined cues to prevent deep sleep.
 */

export type CueType = 'audio' | 'haptic' | 'both';

export interface CueEvent {
  timeMinutes: number;
  timeSeconds: number;
  type: CueType;
  intensity: number;
}

import { calculateNextCueTime, getCueIntensity } from '../session/adaptiveAlgorithm';

/**
 * Generate a complete cue schedule for a session.
 * Returns array of cue events with appropriate timing and intensity.
 */
export function generateSchedule(durationMinutes: number): CueEvent[] {
  const schedule: CueEvent[] = [];
  let currentTimeSeconds = 0;
  const totalSeconds = durationMinutes * 60;

  // Start first cue after initial settling period (3-4 minutes)
  const firstCueDelay = 180 + Math.random() * 60; // 3-4 minutes
  currentTimeSeconds = firstCueDelay;

  while (currentTimeSeconds < totalSeconds) {
    const elapsedMinutes = currentTimeSeconds / 60;
    const intensity = getCueIntensity(elapsedMinutes, durationMinutes);

    // Determine cue type based on intensity
    let type: CueType;
    const rand = Math.random();

    if (intensity < 0.5) {
      // Early session: 60% audio, 30% haptic, 10% both
      if (rand < 0.6) type = 'audio';
      else if (rand < 0.9) type = 'haptic';
      else type = 'both';
    } else if (intensity < 0.8) {
      // Mid session: 40% audio, 40% haptic, 20% both
      if (rand < 0.4) type = 'audio';
      else if (rand < 0.8) type = 'haptic';
      else type = 'both';
    } else {
      // Late session: 30% audio, 30% haptic, 40% both
      if (rand < 0.3) type = 'audio';
      else if (rand < 0.6) type = 'haptic';
      else type = 'both';
    }

    schedule.push({
      timeMinutes: elapsedMinutes,
      timeSeconds: currentTimeSeconds,
      type,
      intensity,
    });

    // Calculate next cue time
    const nextInterval = calculateNextCueTime(elapsedMinutes, durationMinutes);
    currentTimeSeconds += nextInterval;

    // Ensure minimum 20 second spacing
    if (schedule.length > 1) {
      const lastCue = schedule[schedule.length - 2];
      const timeSinceLastCue = currentTimeSeconds - lastCue.timeSeconds;
      if (timeSinceLastCue < 20) {
        currentTimeSeconds = lastCue.timeSeconds + 20;
      }
    }
  }

  return schedule;
}

/**
 * Get the next cue event from a schedule based on current time.
 */
export function getNextCue(
  schedule: CueEvent[],
  currentSeconds: number
): CueEvent | null {
  return schedule.find(cue => cue.timeSeconds > currentSeconds) || null;
}

/**
 * Check if a cue should be triggered at the current time.
 */
export function shouldTriggerCue(
  cue: CueEvent,
  currentSeconds: number,
  tolerance: number = 1
): boolean {
  return Math.abs(cue.timeSeconds - currentSeconds) <= tolerance;
}
