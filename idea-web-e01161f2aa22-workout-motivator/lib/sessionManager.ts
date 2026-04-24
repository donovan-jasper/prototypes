import { useSessionStore } from './store';
import { speakPrompt, stopSpeaking } from './audio';
import { generatePrompt } from './prompts';
import { registerBackgroundAudioTask, cleanupBackgroundAudio } from './backgroundAudio';

let timerInterval: NodeJS.Timeout | null = null;
let promptInterval: NodeJS.Timeout | null = null;
let lastPromptTime = 0;
let sessionStartTime = 0;

export const sessionManager = {
  initialize: async () => {
    await registerBackgroundAudioTask();
  },

  startSession: (taskName: string, coachId: string) => {
    const { startSession } = useSessionStore.getState();
    startSession(taskName, coachId);
    sessionStartTime = Date.now();

    // Start timer
    timerInterval = setInterval(() => {
      const { tick } = useSessionStore.getState();
      tick();
    }, 1000);

    // Schedule prompts
    scheduleNextPrompt();
  },

  handlePause: () => {
    if (promptInterval) {
      clearTimeout(promptInterval);
      promptInterval = null;
    }
  },

  cleanup: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (promptInterval) {
      clearTimeout(promptInterval);
      promptInterval = null;
    }

    stopSpeaking();
    cleanupBackgroundAudio();
  },

  reset: () => {
    sessionManager.cleanup();
    lastPromptTime = 0;
    sessionStartTime = 0;
  }
};

function scheduleNextPrompt() {
  const { taskName, coachId, elapsedSeconds, isPaused } = useSessionStore.getState();

  if (isPaused) return;

  // Calculate time since last prompt
  const timeSinceLastPrompt = elapsedSeconds - lastPromptTime;

  // Determine next prompt interval (2-5 minutes)
  const nextInterval = Math.floor(Math.random() * 180) + 120; // 2-5 minutes in seconds

  promptInterval = setTimeout(async () => {
    try {
      const prompt = generatePrompt(coachId, taskName);
      await speakPrompt(prompt, coachId);
      lastPromptTime = elapsedSeconds;
    } catch (error) {
      console.error('Error playing prompt:', error);
    } finally {
      scheduleNextPrompt();
    }
  }, nextInterval * 1000);
}
