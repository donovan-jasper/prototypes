import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { analyzeMotion } from '../utils/motionAnalysis';
import { analyzeMeteringLevel, resetMeteringHistory } from '../utils/audioAnalysis';
import { AudioController } from './audioControl';

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

    if (this.audioController) {
      await this.audioController.initialize();
    }

    resetMeteringHistory();

    this.motionSubscription = Accelerometer.addListener((data) => {
      this.motionData.push(data);
      if (this.motionData.length > 100) {
        this.motionData.shift();
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

    const motionResult = analyzeMotion(this.motionData);
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

    const combinedConfidence = (motionResult.confidence + audioResult.confidence) / 2;
    const isSleeping = combinedConfidence >= this.confidenceThreshold;

    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        isSleeping,
        confidence: combinedConfidence,
        motionConfidence: motionResult.confidence,
        audioConfidence: audioResult.confidence,
      });
    }

    if (isSleeping && !this.hasTriggeredSleep && this.audioController) {
      this.hasTriggeredSleep = true;
      await this.audioController.fadeOutAndPause();
    }

    setTimeout(() => this.detectionLoop(), 1000);
  }

  public setConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  public getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }
}
