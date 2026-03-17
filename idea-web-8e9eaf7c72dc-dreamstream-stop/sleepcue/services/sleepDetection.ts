import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { analyzeMotion } from '../utils/motionAnalysis';
import { analyzeMeteringLevel, resetMeteringHistory } from '../utils/audioAnalysis';
import { AudioController } from './audioControl';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
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

  public async startDetection(onUpdate: (result: SleepDetectionResult) => void, audioController?: AudioController) {
    if (this.isDetecting) return;

    this.isDetecting = true;
    this.onUpdateCallback = onUpdate;
    this.audioController = audioController || null;
    this.hasTriggeredSleep = false;

    // Reset metering history
    resetMeteringHistory();

    // Start motion detection
    this.motionSubscription = Accelerometer.addListener((data) => {
      this.motionData.push(data);
      if (this.motionData.length > 100) {
        this.motionData.shift();
      }
    });
    Accelerometer.setUpdateInterval(100);

    // Start audio recording for metering
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      this.audioRecording = recording;

      // Check metering level every 5 seconds
      this.meteringCheckInterval = setInterval(() => {
        this.checkMeteringLevel();
      }, 5000);
    } catch (error) {
      console.error('Failed to start audio recording:', error);
    }

    // Start detection loop
    this.detectionLoop();
  }

  public stopDetection() {
    if (!this.isDetecting) return;

    this.isDetecting = false;
    this.onUpdateCallback = null;
    this.audioController = null;
    this.hasTriggeredSleep = false;

    // Stop motion detection
    if (this.motionSubscription) {
      this.motionSubscription.remove();
      this.motionSubscription = null;
    }

    // Stop metering check
    if (this.meteringCheckInterval) {
      clearInterval(this.meteringCheckInterval);
      this.meteringCheckInterval = null;
    }

    // Stop audio recording
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
        // Metering level is in dB, typically ranges from -160 (silence) to 0 (max)
        analyzeMeteringLevel(status.metering);
      }
    } catch (error) {
      console.error('Error checking metering level:', error);
    }
  }

  private async detectionLoop() {
    if (!this.isDetecting) return;

    // Analyze motion data
    const motionResult = analyzeMotion(this.motionData);

    // Get latest audio analysis from metering
    let audioConfidence = 0;
    if (this.audioRecording) {
      try {
        const status = await this.audioRecording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          const audioResult = analyzeMeteringLevel(status.metering);
          audioConfidence = audioResult.confidence;
          
          // Combine results
          const combinedConfidence = (motionResult.confidence + audioConfidence) / 2;
          const isSleeping = combinedConfidence > 0.7; // 70% confidence threshold

          if (this.onUpdateCallback) {
            this.onUpdateCallback({
              isSleeping,
              confidence: combinedConfidence,
            });
          }

          // Trigger audio pause when sleep detected (only once)
          if (isSleeping && !this.hasTriggeredSleep && this.audioController) {
            this.hasTriggeredSleep = true;
            await this.audioController.fadeOutAndPause();
          }
        }
      } catch (err) {
        console.error('Error in detection loop:', err);
      }
    } else {
      // If no audio, use motion only
      const isSleeping = motionResult.confidence > 0.7;
      if (this.onUpdateCallback) {
        this.onUpdateCallback({
          isSleeping,
          confidence: motionResult.confidence,
        });
      }

      // Trigger audio pause when sleep detected (only once)
      if (isSleeping && !this.hasTriggeredSleep && this.audioController) {
        this.hasTriggeredSleep = true;
        await this.audioController.fadeOutAndPause();
      }
    }

    // Continue detection loop
    setTimeout(() => this.detectionLoop(), 1000);
  }
}
