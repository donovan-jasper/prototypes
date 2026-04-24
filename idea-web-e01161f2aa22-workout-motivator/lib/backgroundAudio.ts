import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import { speakPrompt } from './audio';
import { useSessionStore } from './store';
import { generatePrompt } from './prompts';

const BACKGROUND_TASK_NAME = 'motivate-mate-background-audio';
const AUDIO_DUCKING_DURATION = 3000; // 3 seconds

let backgroundTaskRegistered = false;
let soundObject: Audio.Sound | null = null;
let isPlaying = false;

export async function registerBackgroundAudioTask() {
  if (backgroundTaskRegistered) return;

  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
      const now = new Date();
      const sessionState = useSessionStore.getState();

      // Only play if no active foreground session
      if (!sessionState.isActive) {
        await playBackgroundPrompt();
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    });

    backgroundTaskRegistered = true;
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
}

export async function playBackgroundPrompt() {
  if (isPlaying) return;

  try {
    isPlaying = true;

    // Get current session state
    const { taskName, coachId } = useSessionStore.getState();

    // Generate a prompt
    const prompt = generatePrompt(coachId, taskName || 'general');

    // Duck other audio briefly
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    });

    // Play the prompt
    await speakPrompt(prompt, coachId);

    // Wait for ducking to complete
    await new Promise(resolve => setTimeout(resolve, AUDIO_DUCKING_DURATION));

    // Restore audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });

    isPlaying = false;
  } catch (error) {
    console.error('Error playing background prompt:', error);
    isPlaying = false;
  }
}

export async function cleanupBackgroundAudio() {
  if (soundObject) {
    await soundObject.unloadAsync();
    soundObject = null;
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
}
