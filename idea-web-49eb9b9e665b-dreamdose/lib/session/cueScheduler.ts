import { generateSchedule, CueEvent } from '../audio/cueEngine';
import { playCue } from '../audio/soundscapeManager';
import { playPattern } from '../haptics/patternEngine';
import { Session } from './sessionManager';
import { calculateNextCueTime, getCueIntensity } from './adaptiveAlgorithm';

export class CueScheduler {
  private schedule: CueEvent[] = [];
  private currentSession: Session | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private lastCueTime: number = 0;

  constructor() {}

  initialize(session: Session): void {
    this.currentSession = session;
    this.schedule = generateSchedule(session.durationMinutes);
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.lastCueTime = 0;
  }

  start(): void {
    if (!this.currentSession) return;

    this.intervalId = setInterval(() => {
      const elapsedSeconds = this.getAdjustedElapsedSeconds();
      const elapsedMinutes = elapsedSeconds / 60;

      // Calculate adaptive timing
      if (this.lastCueTime === 0 || elapsedSeconds - this.lastCueTime >= calculateNextCueTime(elapsedMinutes, this.currentSession.durationMinutes)) {
        const intensity = getCueIntensity(elapsedMinutes, this.currentSession.durationMinutes);
        this.triggerAdaptiveCue(intensity);
        this.lastCueTime = elapsedSeconds;
      }
    }, 100);
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.pausedTime = Date.now();
    }
  }

  resume(): void {
    if (this.currentSession && !this.intervalId) {
      if (this.pausedTime > 0) {
        this.totalPausedDuration += (Date.now() - this.pausedTime);
        this.pausedTime = 0;
      }
      this.start();
    }
  }

  stop(): void {
    this.pause();
    this.schedule = [];
    this.currentSession = null;
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.lastCueTime = 0;
  }

  private triggerAdaptiveCue(intensity: number): void {
    // Determine cue type based on intensity
    let cueType: 'audio' | 'haptic' | 'both';

    if (intensity < 0.5) {
      cueType = 'audio';
    } else if (intensity < 0.8) {
      cueType = 'haptic';
    } else {
      cueType = 'both';
    }

    if (cueType === 'audio' || cueType === 'both') {
      playCue(intensity);
    }

    if (cueType === 'haptic' || cueType === 'both') {
      playPattern(intensity);
    }
  }

  private getAdjustedElapsedSeconds(): number {
    if (!this.currentSession) return 0;
    const now = Date.now();
    const elapsed = now - this.startTime - this.totalPausedDuration;
    return elapsed / 1000;
  }
}

export const cueScheduler = new CueScheduler();
