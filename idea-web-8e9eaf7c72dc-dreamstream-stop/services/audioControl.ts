import { Audio } from 'expo-av';
import { db } from './database';

class AudioController {
  private soundObject: Audio.Sound | null = null;
  private currentPlaybackStatus: Audio.AudioPlaybackStatus | null = null;
  private lastPauseTime: Date | null = null;
  private batterySavings: number = 0;

  constructor() {
    this.setupAudioSession();
  }

  private async setupAudioSession() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Failed to set audio mode:', error);
    }
  }

  public async pausePlayback(fadeDuration: number = 3) {
    if (!this.soundObject) return;

    try {
      // Get current playback position
      const status = await this.soundObject.getStatusAsync();
      if (!status.isPlaying) return;

      // Calculate fade steps
      const fadeSteps = 10;
      const volumeStep = status.volume / fadeSteps;
      const stepDuration = (fadeDuration * 1000) / fadeSteps;

      // Fade out
      for (let i = 0; i < fadeSteps; i++) {
        await this.soundObject.setVolumeAsync(status.volume - volumeStep);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      // Actually pause
      await this.soundObject.pauseAsync();
      this.lastPauseTime = new Date();

      // Calculate battery savings
      if (this.lastPauseTime) {
        const timeSaved = (Date.now() - this.lastPauseTime.getTime()) / (1000 * 60 * 60); // hours
        this.batterySavings += timeSaved * 0.5; // Assume 0.5% battery per hour saved
        await this.storeBatteryStats(this.batterySavings);
      }
    } catch (error) {
      console.error('Failed to pause playback:', error);
    }
  }

  public async resumePlayback(rewindAmount: number = 2) {
    if (!this.soundObject) return;

    try {
      // Get current playback position
      const status = await this.soundObject.getStatusAsync();

      // Rewind if needed
      if (status.positionMillis > rewindAmount * 60 * 1000) {
        await this.soundObject.setPositionAsync(status.positionMillis - rewindAmount * 60 * 1000);
      }

      // Fade in
      await this.soundObject.setVolumeAsync(0);
      await this.soundObject.playAsync();

      const fadeSteps = 10;
      const volumeStep = 1 / fadeSteps;
      const stepDuration = 300; // 300ms per step

      for (let i = 0; i < fadeSteps; i++) {
        await this.soundObject.setVolumeAsync(volumeStep * (i + 1));
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      await this.soundObject.setVolumeAsync(1);
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }

  public async loadAudio(uri: string) {
    try {
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate
      );

      this.soundObject = sound;
      return sound;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  private onPlaybackStatusUpdate = (status: Audio.AudioPlaybackStatus) => {
    this.currentPlaybackStatus = status;
  };

  private async storeBatteryStats(batterySaved: number) {
    try {
      await db.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          'INSERT INTO battery_stats (battery_saved, timestamp) VALUES (?, ?)',
          [batterySaved, new Date().toISOString()]
        );
      });
    } catch (error) {
      console.error('Failed to store battery stats:', error);
    }
  }

  public getBatterySavings(): number {
    return this.batterySavings;
  }
}

export const audioController = new AudioController();
