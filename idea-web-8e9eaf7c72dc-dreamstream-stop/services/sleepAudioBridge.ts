import { SleepDetector } from './sleepDetection';
import { audioController } from './audioControl';

class SleepAudioBridge {
  private sleepDetector: SleepDetector;
  private isActive: boolean = false;

  constructor() {
    this.sleepDetector = new SleepDetector();
  }

  public async startMonitoring() {
    if (this.isActive) return;

    try {
      // Start sleep detection
      await this.sleepDetector.startDetection();

      // Subscribe to sleep state changes
      this.sleepDetector.onSleepStateChange((isSleeping) => {
        if (isSleeping) {
          audioController.pausePlayback();
        } else {
          audioController.resumePlayback();
        }
      });

      this.isActive = true;
      console.log('Sleep-Audio bridge monitoring started');
    } catch (error) {
      console.error('Failed to start sleep-audio bridge:', error);
      throw error;
    }
  }

  public async stopMonitoring() {
    if (!this.isActive) return;

    try {
      await this.sleepDetector.stopDetection();
      this.isActive = false;
      console.log('Sleep-Audio bridge monitoring stopped');
    } catch (error) {
      console.error('Failed to stop sleep-audio bridge:', error);
      throw error;
    }
  }

  public getStatus(): { isActive: boolean; isSleeping: boolean } {
    return {
      isActive: this.isActive,
      isSleeping: this.sleepDetector.getCurrentState().isSleeping
    };
  }
}

export const sleepAudioBridge = new SleepAudioBridge();
