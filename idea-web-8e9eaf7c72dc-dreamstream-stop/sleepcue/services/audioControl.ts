import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export class AudioController {
  private lastKnownPosition: number = 0;
  private isExternalAudioPlaying: boolean = false;
  private fadeDuration: number = 3000; // 3 seconds default fade
  private rewindAmount: number = 120; // 2 minutes default rewind

  constructor(fadeDuration: number = 3000, rewindAmount: number = 120) {
    this.fadeDuration = fadeDuration;
    this.rewindAmount = rewindAmount;
  }

  public async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
    }
  }

  public async detectExternalAudio(): Promise<boolean> {
    try {
      const status = await Audio.getStatusAsync();
      this.isExternalAudioPlaying = status.isPlaying || false;
      if (status.positionMillis !== undefined) {
        this.lastKnownPosition = status.positionMillis;
      }
      return this.isExternalAudioPlaying;
    } catch (error) {
      console.error('Failed to detect external audio:', error);
      return false;
    }
  }

  public async pauseSystemAudio(): Promise<boolean> {
    try {
      const isPlaying = await this.detectExternalAudio();
      if (isPlaying) {
        await Audio.setIsPlayingAsync(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to pause system audio:', error);
      return false;
    }
  }

  public async resumeSystemAudio(): Promise<boolean> {
    try {
      if (this.rewindAmount > 0 && this.lastKnownPosition > 0) {
        const newPosition = Math.max(0, this.lastKnownPosition - this.rewindAmount * 1000);
        try {
          await Audio.setPositionAsync(newPosition);
        } catch (seekError) {
          console.warn('Could not seek to position, continuing with resume:', seekError);
        }
      }

      await Audio.setIsPlayingAsync(true);
      return true;
    } catch (error) {
      console.error('Failed to resume system audio:', error);
      return false;
    }
  }

  public async fadeOutAndPause(): Promise<boolean> {
    try {
      const isPlaying = await this.detectExternalAudio();
      if (!isPlaying) return false;

      const steps = 10;
      const interval = this.fadeDuration / steps;

      for (let i = steps; i >= 0; i--) {
        const volume = i / steps;
        try {
          await Audio.setVolumeAsync(volume);
        } catch (volumeError) {
          console.warn('Volume control not supported, skipping fade:', volumeError);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      const paused = await this.pauseSystemAudio();

      try {
        await Audio.setVolumeAsync(1.0);
      } catch (volumeError) {
        console.warn('Could not reset volume:', volumeError);
      }

      return paused;
    } catch (error) {
      console.error('Failed to fade out and pause:', error);
      return false;
    }
  }

  public getLastKnownPosition(): number {
    return this.lastKnownPosition;
  }

  public isPlaying(): boolean {
    return this.isExternalAudioPlaying;
  }

  public setFadeDuration(duration: number) {
    this.fadeDuration = Math.max(1000, duration); // Minimum 1 second fade
  }

  public getFadeDuration(): number {
    return this.fadeDuration;
  }

  public setRewindAmount(seconds: number) {
    this.rewindAmount = Math.max(0, seconds);
  }

  public getRewindAmount(): number {
    return this.rewindAmount;
  }
}
