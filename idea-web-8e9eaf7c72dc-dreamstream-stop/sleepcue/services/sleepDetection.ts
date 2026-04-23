import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { analyzeMotion } from '../utils/motionAnalysis';
import { analyzeMeteringLevel, resetMeteringHistory } from '../utils/audioAnalysis';
import { AudioController } from './audioControl';
import { Platform } from 'react-native';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
  motionConfidence: number;
  audioConfidence: number;
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
  private stillnessDuration: number = 0;
  private stillnessThreshold: number = 3 * 60 * 1000; // 3 minutes
  private lastMotionTime: number = 0;
  private motionThreshold: number = 0.05; // m/s²

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
    this.stillnessDuration = 0;
    this.lastMotionTime = Date.now();

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
        analyzeMeteringLevel(status.metering);
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

    // Analyze motion data
    const motionResult = analyzeMotion(this.motionData);

    // Adjust motion confidence based on stillness duration
    let adjustedMotionConfidence = motionResult.confidence;
    if (this.stillnessDuration >= this.stillnessThreshold) {
      // Increase confidence if still for required duration
      adjustedMotionConfidence = Math.min(1, motionResult.confidence + (this.stillnessDuration - this.stillnessThreshold) / (10 * 60 * 1000));
    }

    // Analyze audio data
    let audioResult = { confidence: 0 };
    if (this.audioRecording) {
      try {
        const status = await this.audioRecording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          audioResult = analyzeMeteringLevel(status.metering);
        }
      } catch (err) {
        console.error('Error in detection loop:', err);
      }
    }

    // Combine results
    const combinedConfidence = (adjustedMotionConfidence + audioResult.confidence) / 2;
    const isSleeping = combinedConfidence >= this.confidenceThreshold;

    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        isSleeping,
        confidence: combinedConfidence,
        motionConfidence: adjustedMotionConfidence,
        audioConfidence: audioResult.confidence,
      });
    }

    if (isSleeping && !this.hasTriggeredSleep && this.audioController) {
      this.hasTriggeredSleep = true;
      await this.audioController.fadeOutAndPause();
    }

    setTimeout(() => this.detectionLoop(), 1000);
  }

  public updateConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = Math.min(1, Math.max(0, threshold));
  }

  public getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  public isCurrentlyDetecting(): boolean {
    return this.isDetecting;
  }

  public getStillnessDuration(): number {
    return this.stillnessDuration;
  }

  public getStillnessThreshold(): number {
    return this.stillnessThreshold;
  }
}
