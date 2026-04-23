import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { analyzeMotion, smoothMotionData, detectMovementSpike } from '../utils/motionAnalysis';
import { analyzeMeteringLevel, resetMeteringHistory } from '../utils/audioAnalysis';
import { AudioController } from './audioControl';
import { Platform } from 'react-native';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
  motionConfidence: number;
  audioConfidence: number;
  stillnessDuration: number;
  dominantFrequency: number;
}

export class SleepDetector {
  private isDetecting: boolean = false;
  private motionSubscription: any = null;
  private audioRecording: Audio.Recording | null = null;
  private motionData: { x: number; y: number; z: number }[] = [];
  private onUpdateCallback: ((result: SleepDetectionResult) => void) | null = null;
  private meteringCheckInterval: NodeJS.Timeout | null = null;
  private audioController: AudioController | null = null;
  private hasTriggeredSleep: boolean = false;
  private confidenceThreshold: number = 0.7;
  private lastDetectionTime: number = 0;
  private detectionInterval: number = 5000; // 5 seconds between detections
  private lastMotionTime: number = 0;
  private motionThreshold: number = 0.05; // m/s²
  private stillnessDuration: number = 0;
  private stillnessThreshold: number = 3 * 60 * 1000; // 3 minutes
  private lastAudioResult: any = null;
  private dominantFrequency: number = 0;

  constructor(confidenceThreshold: number = 0.7) {
    this.confidenceThreshold = confidenceThreshold;
  }

  public async startDetection(
    onUpdate: (result: SleepDetectionResult) => void,
    audioController?: AudioController
  ) {
    if (this.isDetecting) return;

    this.isDetecting = true;
    this.onUpdateCallback = onUpdate;
    this.audioController = audioController || null;
    this.hasTriggeredSleep = false;
    this.lastDetectionTime = Date.now();
    this.lastMotionTime = Date.now();
    this.stillnessDuration = 0;
    this.dominantFrequency = 0;

    if (this.audioController) {
      await this.audioController.initialize();
    }

    resetMeteringHistory();

    this.motionSubscription = Accelerometer.addListener((data) => {
      this.motionData.push(data);
      if (this.motionData.length > 100) {
        this.motionData.shift();
      }

      // Calculate motion magnitude
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);

      // Check if motion exceeds threshold
      if (magnitude > this.motionThreshold) {
        this.lastMotionTime = Date.now();
        this.stillnessDuration = 0;
      } else {
        this.stillnessDuration = Date.now() - this.lastMotionTime;
      }
    });
    Accelerometer.setUpdateInterval(100);

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      this.audioRecording = recording;

      this.meteringCheckInterval = setInterval(() => {
        this.checkMeteringLevel();
      }, 1000);
    } catch (error) {
      console.error('Failed to start audio recording:', error);
    }

    this.detectionLoop();
  }

  public stopDetection() {
    if (!this.isDetecting) return;

    this.isDetecting = false;
    this.onUpdateCallback = null;
    this.audioController = null;
    this.hasTriggeredSleep = false;

    if (this.motionSubscription) {
      this.motionSubscription.remove();
      this.motionSubscription = null;
    }

    if (this.meteringCheckInterval) {
      clearInterval(this.meteringCheckInterval);
      this.meteringCheckInterval = null;
    }

    if (this.audioRecording) {
      this.audioRecording.stopAndUnloadAsync().catch(err => {
        console.error('Error stopping recording:', err);
      });
      this.audioRecording = null;
    }

    this.motionData = [];
    resetMeteringHistory();
  }

  private async checkMeteringLevel() {
    if (!this.audioRecording) return;

    try {
      const status = await this.audioRecording.getStatusAsync();
      if (status.isRecording && status.metering !== undefined) {
        this.lastAudioResult = analyzeMeteringLevel(status.metering);
        this.dominantFrequency = this.lastAudioResult.dominantFrequency;
      }
    } catch (error) {
      console.error('Error checking metering level:', error);
    }
  }

  private async detectionLoop() {
    if (!this.isDetecting) return;

    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionInterval) {
      setTimeout(() => this.detectionLoop(), 1000);
      return;
    }

    this.lastDetectionTime = now;

    // Smooth motion data before analysis
    const smoothedData = smoothMotionData(this.motionData);

    // Analyze motion data
    const motionResult = analyzeMotion(smoothedData, this.lastMotionTime);

    // Check for movement spikes
    const hasMovementSpike = detectMovementSpike(this.motionData);

    // Get latest audio analysis result
    const audioResult = this.lastAudioResult || {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude: 0,
      standardDeviation: 0,
      isLowAmplitude: false,
      isLowVariation: false,
      dominantFrequency: 0,
    };

    // Calculate combined confidence
    const combinedConfidence = (motionResult.confidence * 0.6) + (audioResult.confidence * 0.4);

    // Determine if sleep is detected
    const isSleeping = combinedConfidence >= this.confidenceThreshold &&
                      motionResult.isStill &&
                      audioResult.isSleepPattern &&
                      !hasMovementSpike;

    // Update stillness duration
    this.stillnessDuration = motionResult.stillnessDuration;

    // Prepare result
    const result: SleepDetectionResult = {
      isSleeping,
      confidence: combinedConfidence,
      motionConfidence: motionResult.confidence,
      audioConfidence: audioResult.confidence,
      stillnessDuration: this.stillnessDuration,
      dominantFrequency: this.dominantFrequency,
    };

    // Call update callback if provided
    if (this.onUpdateCallback) {
      this.onUpdateCallback(result);
    }

    // Handle sleep detection trigger
    if (isSleeping && !this.hasTriggeredSleep) {
      this.hasTriggeredSleep = true;
      if (this.audioController) {
        await this.audioController.pausePlayback();
      }
    }

    // Reset if user moves again
    if (hasMovementSpike) {
      this.hasTriggeredSleep = false;
    }

    // Continue detection loop
    setTimeout(() => this.detectionLoop(), this.detectionInterval);
  }

  public getCurrentStatus(): SleepDetectionResult {
    // Smooth motion data before analysis
    const smoothedData = smoothMotionData(this.motionData);

    // Analyze motion data
    const motionResult = analyzeMotion(smoothedData, this.lastMotionTime);

    // Get latest audio analysis result
    const audioResult = this.lastAudioResult || {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude: 0,
      standardDeviation: 0,
      isLowAmplitude: false,
      isLowVariation: false,
      dominantFrequency: 0,
    };

    // Calculate combined confidence
    const combinedConfidence = (motionResult.confidence * 0.6) + (audioResult.confidence * 0.4);

    // Determine if sleep is detected
    const isSleeping = combinedConfidence >= this.confidenceThreshold &&
                      motionResult.isStill &&
                      audioResult.isSleepPattern;

    return {
      isSleeping,
      confidence: combinedConfidence,
      motionConfidence: motionResult.confidence,
      audioConfidence: audioResult.confidence,
      stillnessDuration: this.stillnessDuration,
      dominantFrequency: this.dominantFrequency,
    };
  }
}
