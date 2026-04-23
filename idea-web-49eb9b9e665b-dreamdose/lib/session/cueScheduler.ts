import { calculateNextCueTime, getCueIntensity } from './adaptiveAlgorithm';
import { soundscapeManager } from '../audio/soundscapeManager';
import { patternEngine } from '../haptics/patternEngine';
import { logCueEvent } from '../database/queries';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { sessionManager } from './sessionManager';

const BACKGROUND_TASK_NAME = 'restpulse-cue-scheduler';

interface Cue {
  time: number;
  type: 'audio' | 'haptic' | 'both';
  intensity: number;
}

class CueScheduler {
  private currentSessionId: string | null = null;
  private cueTimeouts: NodeJS.Timeout[] = [];
  private backgroundTaskRegistered = false;

  async startSession(sessionId: string, durationMinutes: number, soundscapeId?: string): Promise<void> {
    this.currentSessionId = sessionId;

    // Generate cue schedule
    const cues = this.generateCueSchedule(durationMinutes);

    // Schedule cues
    this.scheduleCues(cues);

    // Start ambient soundscape
    if (soundscapeId) {
      await soundscapeManager.playAmbient(soundscapeId);
    }

    // Register background task if not already registered
    if (!this.backgroundTaskRegistered) {
      await this.registerBackgroundTask();
      this.backgroundTaskRegistered = true;
    }
  }

  private generateCueSchedule(durationMinutes: number): Cue[] {
    const cues: Cue[] = [];
    let elapsedMinutes = 0;
    const totalMinutes = durationMinutes;

    // Generate cues until we reach the session duration
    while (elapsedMinutes < totalMinutes) {
      const nextCueTime = calculateNextCueTime(elapsedMinutes, totalMinutes);
      const intensity = getCueIntensity(elapsedMinutes, totalMinutes);

      // Determine cue type (audio, haptic, or both)
      let type: 'audio' | 'haptic' | 'both';
      if (elapsedMinutes < totalMinutes * 0.7) {
        type = 'audio'; // Early session: mostly audio
      } else if (elapsedMinutes > totalMinutes * 0.9) {
        type = 'both'; // Final 10%: both audio and haptic
      } else {
        type = 'haptic'; // Middle: mostly haptic
      }

      cues.push({
        time: nextCueTime * 1000, // Convert to milliseconds
        type,
        intensity,
      });

      elapsedMinutes += nextCueTime / 60; // Convert seconds to minutes
    }

    return cues;
  }

  private scheduleCues(cues: Cue[]): void {
    // Clear any existing timeouts
    this.clearScheduledCues();

    // Schedule each cue
    cues.forEach((cue, index) => {
      const timeout = setTimeout(async () => {
        try {
          // Trigger the appropriate cue
          if (cue.type === 'audio' || cue.type === 'both') {
            await soundscapeManager.playCue(cue.intensity);
          }
          if (cue.type === 'haptic' || cue.type === 'both') {
            await patternEngine.playPattern(cue.intensity);
          }

          // Log the cue event to database
          if (this.currentSessionId) {
            await logCueEvent(this.currentSessionId, Date.now(), cue.type, cue.intensity);
          }
        } catch (error) {
          console.error('Error triggering cue:', error);
        }
      }, cue.time);

      this.cueTimeouts.push(timeout);
    });
  }

  private async registerBackgroundTask(): Promise<void> {
    // Define the background task
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
      if (!this.currentSessionId) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      try {
        // Get the current session
        const session = await sessionManager.getSession(this.currentSessionId);
        if (!session || session.status !== 'active') {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Calculate elapsed time
        const elapsedMinutes = (Date.now() - session.startTime) / 60000;

        // If session is complete, stop the scheduler
        if (elapsedMinutes >= session.durationMinutes) {
          await this.endSession();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }

        // Otherwise, continue scheduling cues
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60, // Run every minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async pauseSession(): Promise<void> {
    this.clearScheduledCues();
    await soundscapeManager.pauseAmbient();
  }

  async resumeSession(): Promise<void> {
    if (!this.currentSessionId) return;

    const session = await sessionManager.getSession(this.currentSessionId);
    if (!session) return;

    const elapsedMinutes = (Date.now() - session.startTime) / 60000;
    const remainingMinutes = session.durationMinutes - elapsedMinutes;

    if (remainingMinutes > 0) {
      const cues = this.generateCueSchedule(remainingMinutes);
      this.scheduleCues(cues);
      await soundscapeManager.resumeAmbient();
    }
  }

  async endSession(): Promise<void> {
    this.clearScheduledCues();
    await soundscapeManager.stopAll();
    this.currentSessionId = null;
  }

  private clearScheduledCues(): void {
    this.cueTimeouts.forEach(timeout => clearTimeout(timeout));
    this.cueTimeouts = [];
  }
}

export const cueScheduler = new CueScheduler();
