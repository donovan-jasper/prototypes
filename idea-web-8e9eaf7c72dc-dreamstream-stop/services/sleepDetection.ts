import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';
import { db } from './database';

const SLEEP_DETECTION_TASK = 'sleep-detection-task';
const SAMPLE_RATE = 10; // Hz
const STILLNESS_THRESHOLD = 0.05; // m/s²
const STILLNESS_DURATION = 3 * 60 * 1000; // 3 minutes in ms
const AUDIO_SAMPLE_INTERVAL = 30 * 1000; // 30 seconds

interface SleepState {
  isSleeping: boolean;
  confidence: number;
  lastUpdated: Date;
}

class SleepDetector {
  private accelerometerSubscription: any;
  private audioRecording: Audio.Recording | null = null;
  private lastMotionData: { x: number; y: number; z: number }[] = [];
  private stillnessStartTime: number | null = null;
  private currentSleepState: SleepState = {
    isSleeping: false,
    confidence: 0,
    lastUpdated: new Date()
  };

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
        this.lastMotionData.push(data);
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
      lastUpdated: new Date()
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
    // In a real implementation, this would use FFT to analyze frequency spectrum
    // For this prototype, we'll simulate breathing pattern detection (2-8 Hz)
    const randomFrequency = 2 + Math.random() * 6; // Simulate breathing frequency
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

    if (avgMagnitude < STILLNESS_THRESHOLD) {
      if (this.stillnessStartTime === null) {
        this.stillnessStartTime = Date.now();
      } else if (Date.now() - this.stillnessStartTime >= STILLNESS_DURATION) {
        // Device has been still for 3+ minutes
        this.updateSleepState(true);
      }
    } else {
      this.stillnessStartTime = null;
      this.updateSleepState(false);
    }
  }

  private updateSleepState(isSleeping: boolean) {
    const now = new Date();
    const confidence = isSleeping ? 100 : 0;

    if (this.currentSleepState.isSleeping !== isSleeping ||
        this.currentSleepState.confidence !== confidence) {
      this.currentSleepState = {
        isSleeping,
        confidence,
        lastUpdated: now
      };

      // Store in database
      this.storeSleepState(isSleeping, confidence, now);
    }
  }

  private async storeSleepState(isSleeping: boolean, confidence: number, timestamp: Date) {
    try {
      await db.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          'INSERT INTO sleep_sessions (is_sleeping, confidence, timestamp) VALUES (?, ?, ?)',
          [isSleeping ? 1 : 0, confidence, timestamp.toISOString()]
        );
      });
    } catch (error) {
      console.error('Failed to store sleep state:', error);
    }
  }

  public getCurrentState(): SleepState {
    return this.currentSleepState;
  }
}

export const sleepDetector = new SleepDetector();
