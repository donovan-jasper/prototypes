import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import { speakPrompt, stopSpeaking } from './audio';
import { useSessionStore } from './store';
import { generatePrompt } from './prompts';

const BACKGROUND_TASK_NAME = 'motivemate-background-audio';
const AUDIO_DUCKING_DURATION = 3000; // 3 seconds
const MIN_INTERVAL = 15 * 60; // 15 minutes in seconds
const MAX_INTERVAL = 30 * 60; // 30 minutes in seconds

let backgroundTaskRegistered = false;
let isPlaying = false;
let lastPlayTime = 0;
let audioModeSet = false;

export async function registerBackgroundAudioTask() {
  if (backgroundTaskRegistered) return;

  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: MIN_INTERVAL,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
      const now = Date.now() / 1000; // Current time in seconds
      const sessionState = useSessionStore.getState();

      // Only play if no active foreground session and enough time has passed
      if (!sessionState.isActive && now - lastPlayTime >= getRandomInterval()) {
        await playBackgroundPrompt();
        lastPlayTime = now;
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    });

    backgroundTaskRegistered = true;
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
}

function getRandomInterval(): number {
  return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
}

export async function playBackgroundPrompt() {
  if (isPlaying) return;

  try {
    isPlaying = true;

    // Get current session state
    const { taskName, coachId } = useSessionStore.getState();

    // Generate a prompt
    const prompt = generatePrompt(coachId, taskName || 'general');

    // Set audio mode for ducking
    if (!audioModeSet) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      });
      audioModeSet = true;
    }

    // Play the prompt at low volume
    await speakPrompt(prompt, coachId, 0.5); // 0.5 volume for ambient mode

    // Wait for ducking to complete
    await new Promise(resolve => setTimeout(resolve, AUDIO_DUCKING_DURATION));

    // Restore audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    });
    audioModeSet = false;

    isPlaying = false;
  } catch (error) {
    console.error('Error playing background prompt:', error);
    isPlaying = false;
    audioModeSet = false;
  }
}

export async function cleanupBackgroundAudio() {
  if (isPlaying) {
    await stopSpeaking();
  }

  if (backgroundTaskRegistered) {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
      backgroundTaskRegistered = false;
    } catch (error) {
      console.error('Failed to unregister background task:', error);
    }
  }

  isPlaying = false;
  audioModeSet = false;
}
