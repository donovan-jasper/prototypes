import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { analyzeMotion } from '../utils/motionAnalysis';
import { analyzeAudio } from '../utils/audioAnalysis';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
}

export class SleepDetector {
  private isDetecting: boolean = false;
  private motionSubscription: number | null = null;
  private audioRecording: Audio.Recording | null = null;
  private motionData: { x: number; y: number; z: number }[] = [];
  private audioData: Float32Array[] = [];
  private onUpdateCallback: ((result: SleepDetectionResult) => void) | null = null;

  public async startDetection(onUpdate: (result: SleepDetectionResult) => void) {
    if (this.isDetecting) return;

    this.isDetecting = true;
    this.onUpdateCallback = onUpdate;

    // Start motion detection
    this.motionSubscription = Accelerometer.addListener((data) => {
      this.motionData.push(data);
      if (this.motionData.length > 100) {
        this.motionData.shift();
      }
    });
    Accelerometer.setUpdateInterval(100);

    // Start audio recording
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      this.audioRecording = recording;

      // Set up periodic audio analysis
      this.setupAudioAnalysis();
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

    // Stop motion detection
    if (this.motionSubscription) {
      Accelerometer.removeSubscription(this.motionSubscription);
      this.motionSubscription = null;
    }

    // Stop audio recording
    if (this.audioRecording) {
      this.audioRecording.stopAndUnloadAsync();
      this.audioRecording = null;
    }

    this.motionData = [];
    this.audioData = [];
  }

  private async setupAudioAnalysis() {
    if (!this.audioRecording) return;

    setInterval(async () => {
      if (!this.audioRecording) return;

      try {
        const status = await this.audioRecording.getStatusAsync();
        if (status.isDoneRecording) {
          // Restart recording if it's done
          await this.audioRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          await this.audioRecording.startAsync();
        } else {
          // Get audio data
          const uri = this.audioRecording.getURI();
          if (uri) {
            const { sound } = await Audio.Sound.createAsync({ uri });
            const samples = await sound.getAudioSamplesAsync(1000); // Get 1 second of samples
            if (samples.isLoaded) {
              this.audioData.push(samples.samples);
              if (this.audioData.length > 10) {
                this.audioData.shift();
              }
            }
            await sound.unloadAsync();
          }
        }
      } catch (error) {
        console.error('Audio analysis error:', error);
      }
    }, 30000); // Analyze every 30 seconds
  }

  private detectionLoop() {
    if (!this.isDetecting) return;

    // Analyze motion data
    const motionResult = analyzeMotion(this.motionData);

    // Analyze audio data
    const audioResult = analyzeAudio(this.audioData);

    // Combine results
    const combinedConfidence = (motionResult.confidence + audioResult.confidence) / 2;
    const isSleeping = combinedConfidence > 0.7; // 70% confidence threshold

    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        isSleeping,
        confidence: combinedConfidence,
      });
    }

    // Continue detection loop
    setTimeout(() => this.detectionLoop(), 1000);
  }
}
