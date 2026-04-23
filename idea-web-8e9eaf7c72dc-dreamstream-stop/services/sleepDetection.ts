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
    if (this.lastMotionData.length < SAMPLE_RATE * 5) return;

    // Calculate average magnitude of acceleration
    const magnitudes = this.lastMotionData.map(data =>
      Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z)
    );

    const avgMagnitude = magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;

    if (avgMagnitude < STILLNESS_THRESHOLD) {
      if (!this.stillnessStartTime) {
        this.stillnessStartTime = Date.now();
      }

      const stillnessDuration = Date.now() - this.stillnessStartTime;
      const confidence = Math.min(100, (stillnessDuration / STILLNESS_DURATION) * 100);

      this.currentSleepState = {
        isSleeping: stillnessDuration >= STILLNESS_DURATION,
        confidence,
        lastUpdated: new Date()
      };

      if (this.currentSleepState.isSleeping && this.sleepStateChangeCallback) {
        this.sleepStateChangeCallback(true);
      }
    } else {
      this.stillnessStartTime = null;
      this.currentSleepState = {
        isSleeping: false,
        confidence: 0,
        lastUpdated: new Date()
      };

      if (this.sleepStateChangeCallback) {
        this.sleepStateChangeCallback(false);
      }
    }
  }

  private processSensorData(accelerometerData: any, audioData: any) {
    if (accelerometerData) {
      this.lastMotionData.push(accelerometerData);
      if (this.lastMotionData.length > SAMPLE_RATE * 5) {
        this.lastMotionData.shift();
      }
      this.checkStillness();
    }

    if (audioData) {
      // Process audio data for sleep detection
      // This would include frequency analysis for breathing patterns
      // For now, we'll just update the confidence based on audio amplitude
      const audioConfidence = audioData.amplitude * 100;
      this.currentSleepState.confidence = Math.min(
        100,
        this.currentSleepState.confidence + audioConfidence
      );

      if (this.currentSleepState.confidence >= 80 && !this.currentSleepState.isSleeping) {
        this.currentSleepState.isSleeping = true;
        if (this.sleepStateChangeCallback) {
          this.sleepStateChangeCallback(true);
        }
      }
    }
  }

  public onSleepStateChange(callback: (isSleeping: boolean) => void) {
    this.sleepStateChangeCallback = callback;
  }

  public getCurrentState(): SleepState {
    return this.currentSleepState;
  }
}

export { SleepDetector };
