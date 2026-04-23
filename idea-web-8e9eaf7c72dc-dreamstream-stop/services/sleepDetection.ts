import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';
import { db } from './database';

const SLEEP_DETECTION_TASK = 'sleep-detection-task';
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

  constructor() {
    this.setupBackgroundTask();
  }

  private async setupBackgroundTask() {
    try {
      await TaskManager.defineTask(SLEEP_DETECTION_TASK, async ({ data, error }) => {
        if (error) {
          console.error('Background task error:', error);
          return;
        }

        if (data) {
          const { accelerometerData, audioData } = data;
          this.processSensorData(accelerometerData, audioData);
        }
      });
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

      // Start background task
      await TaskManager.isTaskRegisteredAsync(SLEEP_DETECTION_TASK)
        .then(async (isRegistered) => {
          if (!isRegistered) {
            await TaskManager.registerTaskAsync(SLEEP_DETECTION_TASK, {
              minInterval: 1000, // Run every second
              stopOnTerminate: false,
              startOnBoot: true,
            });
          }
        });

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
    // Simulate breathing pattern detection (2-8 Hz)
    // In a real implementation, this would use FFT to analyze frequency spectrum
    const randomFrequency = BREATHING_FREQUENCY_RANGE.min +
      Math.random() * (BREATHING_FREQUENCY_RANGE.max - BREATHING_FREQUENCY_RANGE.min);
    const randomAmplitude = Math.random() * 0.5; // Simulate amplitude

    return {
      frequency: randomFrequency,
      amplitude: randomAmplitude
    };
  }

  private checkStillness() {
    if (this.lastMotionData.length < SAMPLE_RATE) return;

    // Calculate average movement magnitude
    const magnitudes = this.lastMotionData.map(data =>
      Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z)
    );
    const avgMagnitude = magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;

    // Check if stillness threshold is met
    if (avgMagnitude < STILLNESS_THRESHOLD) {
      if (this.stillnessStartTime === null) {
        this.stillnessStartTime = Date.now();
      }

      // Calculate motion confidence (higher if still for longer periods)
      const stillnessDuration = Date.now() - this.stillnessStartTime;
      const motionConfidence = Math.min(100, (stillnessDuration / STILLNESS_DURATION) * 100);

      this.currentSleepState = {
        ...this.currentSleepState,
        motionConfidence,
        lastUpdated: new Date()
      };

      // Check if stillness duration meets threshold
      if (stillnessDuration >= STILLNESS_DURATION) {
        this.updateSleepState(true);
      }
    } else {
      this.stillnessStartTime = null;
      this.currentSleepState = {
        ...this.currentSleepState,
        motionConfidence: 0,
        lastUpdated: new Date()
      };
      this.updateSleepState(false);
    }
  }

  private processSensorData(accelerometerData: any, audioData: any) {
    if (accelerometerData) {
      this.lastMotionData.push({ ...accelerometerData, timestamp: Date.now() });
      if (this.lastMotionData.length > SAMPLE_RATE * 5) {
        this.lastMotionData.shift();
      }
      this.checkStillness();
    }

    if (audioData) {
      // Calculate audio confidence based on breathing pattern detection
      const audioConfidence = this.calculateAudioConfidence(audioData);
      this.currentSleepState = {
        ...this.currentSleepState,
        audioConfidence,
        lastUpdated: new Date()
      };

      // Update overall sleep state
      this.updateSleepState();
    }
  }

  private calculateAudioConfidence(audioData: { frequency: number; amplitude: number }): number {
    // Check if frequency is within breathing range
    const inBreathingRange = audioData.frequency >= BREATHING_FREQUENCY_RANGE.min &&
                             audioData.frequency <= BREATHING_FREQUENCY_RANGE.max;

    // Calculate confidence based on amplitude and frequency
    let confidence = 0;
    if (inBreathingRange) {
      // Higher amplitude = higher confidence (capped at 100)
      confidence = Math.min(100, audioData.amplitude * 200);
    }

    return confidence;
  }

  private updateSleepState(forceState?: boolean) {
    const { motionConfidence, audioConfidence } = this.currentSleepState;

    // Calculate combined confidence
    const combinedConfidence = (motionConfidence * 0.6) + (audioConfidence * 0.4);

    // Determine sleep state
    let isSleeping = combinedConfidence >= 70; // 70% confidence threshold

    if (forceState !== undefined) {
      isSleeping = forceState;
    }

    // Only update if state changed
    if (this.currentSleepState.isSleeping !== isSleeping) {
      this.currentSleepState = {
        ...this.currentSleepState,
        isSleeping,
        confidence: combinedConfidence,
        lastUpdated: new Date()
      };

      // Log to database
      this.logSleepState();

      // Notify callback if registered
      if (this.sleepStateChangeCallback) {
        this.sleepStateChangeCallback(isSleeping);
      }
    }
  }

  private async logSleepState() {
    try {
      await db.transactionAsync(async (tx) => {
        await tx.executeSql(
          `INSERT INTO sleep_sessions (timestamp, is_sleeping, confidence, motion_confidence, audio_confidence)
           VALUES (?, ?, ?, ?, ?)`,
          [
            this.currentSleepState.lastUpdated.toISOString(),
            this.currentSleepState.isSleeping ? 1 : 0,
            this.currentSleepState.confidence,
            this.currentSleepState.motionConfidence,
            this.currentSleepState.audioConfidence
          ]
        );
      });
    } catch (error) {
      console.error('Failed to log sleep state:', error);
    }
  }

  public onSleepStateChange(callback: (isSleeping: boolean) => void) {
    this.sleepStateChangeCallback = callback;
  }

  public getCurrentState(): SleepState {
    return this.currentSleepState;
  }
}

export const sleepDetector = new SleepDetector();
