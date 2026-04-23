import { generateSchedule, CueEvent } from '../audio/cueEngine';
import { playCue } from '../audio/soundscapeManager';
import { playPattern } from '../haptics/patternEngine';
import { Session } from './sessionManager';

export class CueScheduler {
  private schedule: CueEvent[] = [];
  private currentSession: Session | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  constructor() {}

  initialize(session: Session): void {
    this.currentSession = session;
    this.schedule = generateSchedule(session.durationMinutes);
    this.startTime = Date.now();
  }

  start(): void {
    if (!this.currentSession) return;

    this.intervalId = setInterval(() => {
      const elapsedSeconds = (Date.now() - this.startTime) / 1000;
      const cuesToTrigger = this.schedule.filter(cue =>
        Math.abs(cue.timeSeconds - elapsedSeconds) <= 0.5
      );

      cuesToTrigger.forEach(cue => {
        this.triggerCue(cue);
      });
    }, 100);
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (this.currentSession && !this.intervalId) {
      this.startTime = Date.now() - (this.getElapsedSeconds() * 1000);
      this.start();
    }
  }

  stop(): void {
    this.pause();
    this.schedule = [];
    this.currentSession = null;
  }

  private triggerCue(cue: CueEvent): void {
    if (cue.type === 'audio' || cue.type === 'both') {
      playCue(cue.intensity);
    }

    if (cue.type === 'haptic' || cue.type === 'both') {
      playPattern(cue.intensity);
    }
  }

  private getElapsedSeconds(): number {
    if (!this.currentSession) return 0;
    return (Date.now() - this.startTime) / 1000;
  }
}

export const cueScheduler = new CueScheduler();
