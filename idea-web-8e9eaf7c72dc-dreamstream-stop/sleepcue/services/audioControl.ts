import { Audio } from 'expo-av';

export class AudioController {
  private lastKnownPosition: number = 0;
  private isExternalAudioPlaying: boolean = false;

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

  public async resumeSystemAudio(rewindSeconds: number = 0): Promise<boolean> {
    try {
      if (rewindSeconds > 0 && this.lastKnownPosition > 0) {
        const newPosition = Math.max(0, this.lastKnownPosition - rewindSeconds * 1000);
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

  public async fadeOutAndPause(duration: number = 3000): Promise<boolean> {
    try {
      const isPlaying = await this.detectExternalAudio();
      if (!isPlaying) return false;

      const steps = 10;
      const interval = duration / steps;

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
}
