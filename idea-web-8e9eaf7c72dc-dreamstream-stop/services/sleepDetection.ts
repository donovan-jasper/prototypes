import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { db } from './database';

const SLEEP_DETECTION_TASK = 'sleep-detection-task';
const BACKGROUND_SLEEP_TASK = 'background-sleep-detection-task';
const SAMPLE_RATE = 10; // Hz
const STILLNESS_THRESHOLD = 0.05; // m/s²
const STILLNESS_DURATION = 3 * 60 * 1000; // 3 minutes in ms
const AUDIO_SAMPLE_INTERVAL = 30 * 1000; // 30 seconds
const BREATHING_FREQUENCY_RANGE = { min: 2, max: 8 }; // Hz

interface SleepState {
  isSleeping: boolean;
  confidence: number;
  lastUpdated: Date;
  motionConfidence: number;
  audioConfidence: number;
}

class SleepDetector {
  private accelerometerSubscription: any;
  private audioRecording: Audio.Recording | null = null;
  private lastMotionData: { x: number; y: number; z: number; timestamp: number }[] = [];
  private stillnessStartTime: number | null = null;
  private currentSleepState: SleepState = {
    isSleeping: false,
    confidence: 0,
    lastUpdated: new Date(),
    motionConfidence: 0,
    audioConfidence: 0
  };
  private sleepStateChangeCallback: ((isSleeping: boolean) => void) | null = null;
  private backgroundTaskRegistered: boolean = false;

  constructor() {
    this.setupBackgroundTask();
  }

  private async setupBackgroundTask() {
    try {
      // Define the background task
      await TaskManager.defineTask(BACKGROUND_SLEEP_TASK, async ({ data, error }) => {
        if (error) {
          console.error('Background task error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        // Process sensor data in background
        const accelerometerData = await this.getAccelerometerData();
        const audioData = await this.analyzeAudio();

        this.processSensorData(accelerometerData, audioData);

        // Return the status of the task
        return BackgroundFetch.BackgroundFetchResult.NewData;
      });

      // Register the task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SLEEP_TASK, {
        minimumInterval: 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.backgroundTaskRegistered = true;
      console.log('Background sleep detection task registered');
    } catch (error) {
      console.error('Failed to define background task:', error);
    }
  }

  public async startDetection() {
    try {
      // Start accelerometer monitoring
      this.accelerometerSubscription = Accelerometer.addListener((data) => {
        this.lastMotionData.push({ ...data, timestamp: Date.now() });
        if (this.lastMotionData.length > SAMPLE_RATE * 5) {
          this.lastMotionData.shift(); // Keep last 5 seconds of data
        }
        this.checkStillness();
      });

      // Start audio monitoring
      await this.startAudioRecording();

      console.log('Sleep detection started');
    } catch (error) {
      console.error('Failed to start sleep detection:', error);
      throw error;
    }
  }

  public async stopDetection() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.audioRecording) {
      await this.audioRecording.stopAndUnloadAsync();
      this.audioRecording = null;
    }

    this.lastMotionData = [];
    this.stillnessStartTime = null;
    this.currentSleepState = {
      isSleeping: false,
      confidence: 0,
      lastUpdated: new Date(),
      motionConfidence: 0,
      audioConfidence: 0
    };

    console.log('Sleep detection stopped');
  }

  private async startAudioRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      this.audioRecording = new Audio.Recording();
      await this.audioRecording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.audioRecording.startAsync();

      // Schedule periodic audio analysis
      setInterval(async () => {
        if (this.audioRecording) {
          const status = await this.audioRecording.getStatusAsync();
          if (status.isRecording) {
            const audioData = await this.analyzeAudio();
            this.processSensorData(null, audioData);
          }
        }
      }, AUDIO_SAMPLE_INTERVAL);
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      throw error;
    }
  }

  private async analyzeAudio(): Promise<{ frequency: number; amplitude: number }> {
    // In a real implementation, this would use FFT to analyze the audio spectrum
    // For this example, we'll simulate breathing pattern detection (2-8 Hz)

    // Generate random breathing pattern for simulation
    const frequency = Math.random() * (BREATHING_FREQUENCY_RANGE.max - BREATHING_FREQUENCY_RANGE.min) + BREATHING_FREQUENCY_RANGE.min;
    const amplitude = Math.random() * 0.5 + 0.5; // 0.5-1.0

    return { frequency, amplitude };
  }

  private async getAccelerometerData(): Promise<{ x: number; y: number; z: number }> {
    // In a real implementation, this would get the latest accelerometer data
    // For simulation, we'll return random data
    return {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1
    };
  }

  private checkStillness() {
    if (this.lastMotionData.length < SAMPLE_RATE) return;

    // Calculate average movement magnitude
    const magnitudes = this.lastMotionData.map(data =>
      Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z)
    );

    const avgMagnitude = magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;

    if (avgMagnitude < STILLNESS_THRESHOLD) {
      // Device is still
      if (!this.stillnessStartTime) {
        this.stillnessStartTime = Date.now();
      }

      // Calculate stillness duration
      const stillnessDuration = Date.now() - this.stillnessStartTime;

      // Update motion confidence (0-100%)
      const confidence = Math.min(100, (stillnessDuration / STILLNESS_DURATION) * 100);

      // Update sleep state
      this.currentSleepState = {
        ...this.currentSleepState,
        isSleeping: confidence >= 70,
        confidence: Math.max(this.currentSleepState.confidence, confidence),
        lastUpdated: new Date(),
        motionConfidence: confidence
      };

      // Notify if sleep state changed
      if (this.currentSleepState.isSleeping && this.sleepStateChangeCallback) {
        this.sleepStateChangeCallback(true);
      }
    } else {
      // Device is moving
      this.stillnessStartTime = null;

      // Reset motion confidence if we were previously sleeping
      if (this.currentSleepState.isSleeping) {
        this.currentSleepState = {
          ...this.currentSleepState,
          isSleeping: false,
          confidence: 0,
          lastUpdated: new Date(),
          motionConfidence: 0
        };

        if (this.sleepStateChangeCallback) {
          this.sleepStateChangeCallback(false);
        }
      }
    }
  }

  private processSensorData(
    accelerometerData: { x: number; y: number; z: number } | null,
    audioData: { frequency: number; amplitude: number } | null
  ) {
    // Process accelerometer data if available
    if (accelerometerData) {
      this.lastMotionData.push({ ...accelerometerData, timestamp: Date.now() });
      if (this.lastMotionData.length > SAMPLE_RATE * 5) {
        this.lastMotionData.shift();
      }
      this.checkStillness();
    }

    // Process audio data if available
    if (audioData) {
      // Check if audio matches breathing pattern
      const isBreathing = audioData.frequency >= BREATHING_FREQUENCY_RANGE.min &&
                          audioData.frequency <= BREATHING_FREQUENCY_RANGE.max &&
                          audioData.amplitude > 0.3;

      // Update audio confidence (0-100%)
      const audioConfidence = isBreathing ? Math.min(100, audioData.amplitude * 100) : 0;

      // Update sleep state
      this.currentSleepState = {
        ...this.currentSleepState,
        isSleeping: this.currentSleepState.isSleeping || (audioConfidence >= 70 && this.currentSleepState.motionConfidence >= 70),
        confidence: Math.max(this.currentSleepState.confidence, Math.min(audioConfidence, this.currentSleepState.motionConfidence)),
        lastUpdated: new Date(),
        audioConfidence
      };

      // Notify if sleep state changed
      if (this.currentSleepState.isSleeping && this.sleepStateChangeCallback) {
        this.sleepStateChangeCallback(true);
      }
    }
  }

  public onSleepStateChange(callback: (isSleeping: boolean) => void) {
    this.sleepStateChangeCallback = callback;
  }

  public getCurrentState(): SleepState {
    return this.currentSleepState;
  }

  public async checkBackgroundTaskStatus() {
    if (this.backgroundTaskRegistered) {
      const status = await BackgroundFetch.getStatusAsync();
      console.log('Background task status:', status);
      return status;
    }
    return null;
  }
}

export const sleepDetector = new SleepDetector();
