import { useSessionStore } from './store';
import { generatePrompt, selectPromptByIntensity, getRandomInterval } from './prompts';
import { speakPrompt, stopSpeaking } from './audio';
import { CoachId } from '../constants/Prompts';

export class SessionManager {
  private timer: NodeJS.Timeout | null = null;
  private lastPromptTime: number = 0;
  private nextPromptTime: number = 0;
  private pauseStartTime: number = 0;

  constructor() {
    this.setupTimer();
  }

  private setupTimer() {
    this.timer = setInterval(() => {
      const { isActive, isPaused, elapsedSeconds } = useSessionStore.getState();

      if (!isActive || isPaused) return;

      if (elapsedSeconds >= this.nextPromptTime) {
        this.triggerPrompt();
      }
    }, 1000);
  }

  private triggerPrompt() {
    const { coachId, elapsedSeconds } = useSessionStore.getState();

    if (!coachId) return;

    const secondsSinceLastPrompt = elapsedSeconds - this.lastPromptTime;
    const prompt = selectPromptByIntensity(coachId as CoachId, secondsSinceLastPrompt);

    this.lastPromptTime = elapsedSeconds;
    this.nextPromptTime = elapsedSeconds + getRandomInterval();

    speakPrompt(prompt, coachId);
  }

  public handlePause() {
    const { isPaused } = useSessionStore.getState();

    if (!isPaused) {
      this.pauseStartTime = Date.now();
    } else {
      const pauseDuration = (Date.now() - this.pauseStartTime) / 1000;
      // Adjust next prompt time based on pause duration
      this.nextPromptTime = Math.max(
        this.nextPromptTime - Math.floor(pauseDuration),
        this.lastPromptTime + 60 // Minimum 1 minute between prompts
      );
    }
  }

  public reset() {
    this.lastPromptTime = 0;
    this.nextPromptTime = getRandomInterval();
    this.pauseStartTime = 0;
  }

  public cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    stopSpeaking();
  }
}

export const sessionManager = new SessionManager();
