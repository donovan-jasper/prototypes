import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { MediaController } from 'expo-media-controller';
import { MPNowPlayingInfoCenter } from 'expo-media-library';

export class AudioController {
  private lastKnownPosition: number = 0;
  private isExternalAudioPlaying: boolean = false;
  private fadeDuration: number = 3000; // 3 seconds default fade
  private rewindAmount: number = 120; // 2 minutes default rewind
  private mediaController: any = null;
  private nowPlayingInfoCenter: any = null;

  constructor(fadeDuration: number = 3000, rewindAmount: number = 120) {
    this.fadeDuration = fadeDuration;
    this.rewindAmount = rewindAmount;

    if (Platform.OS === 'android') {
      this.mediaController = new MediaController();
    } else if (Platform.OS === 'ios') {
      this.nowPlayingInfoCenter = new MPNowPlayingInfoCenter();
    }
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

      if (this.mediaController) {
        this.mediaController.addEventListener('play', this.handlePlayEvent);
        this.mediaController.addEventListener('pause', this.handlePauseEvent);
        this.mediaController.addEventListener('seek', this.handleSeekEvent);
      }

      if (this.nowPlayingInfoCenter) {
        this.nowPlayingInfoCenter.addEventListener('playbackStateDidChange', this.handlePlaybackStateChange);
      }
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
    }
  }

  private handlePlayEvent = (event: any) => {
    this.isExternalAudioPlaying = true;
    this.lastKnownPosition = event.position || 0;
  };

  private handlePauseEvent = (event: any) => {
    this.isExternalAudioPlaying = false;
    this.lastKnownPosition = event.position || 0;
  };

  private handleSeekEvent = (event: any) => {
    this.lastKnownPosition = event.position || 0;
  };

  private handlePlaybackStateChange = (event: any) => {
    this.isExternalAudioPlaying = event.state === 'playing';
    if (event.position !== undefined) {
      this.lastKnownPosition = event.position;
    }
  };

  public async detectExternalAudio(): Promise<boolean> {
    try {
      if (this.mediaController) {
        const status = await this.mediaController.getStatusAsync();
        this.isExternalAudioPlaying = status.isPlaying || false;
        if (status.position !== undefined) {
          this.lastKnownPosition = status.position;
        }
        return this.isExternalAudioPlaying;
      } else if (this.nowPlayingInfoCenter) {
        const info = await this.nowPlayingInfoCenter.getNowPlayingInfoAsync();
        this.isExternalAudioPlaying = info.playbackRate > 0;
        if (info.elapsedPlaybackTime !== undefined) {
          this.lastKnownPosition = info.elapsedPlaybackTime;
        }
        return this.isExternalAudioPlaying;
      }

      // Fallback to expo-av if native APIs aren't available
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
      if (this.mediaController) {
        await this.mediaController.pauseAsync();
        this.isExternalAudioPlaying = false;
        return true;
      } else if (this.nowPlayingInfoCenter) {
        await this.nowPlayingInfoCenter.pauseAsync();
        this.isExternalAudioPlaying = false;
        return true;
      }

      // Fallback to expo-av
      const isPlaying = await this.detectExternalAudio();
      if (isPlaying) {
        await Audio.setIsPlayingAsync(false);
        this.isExternalAudioPlaying = false;
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

        if (this.mediaController) {
          await this.mediaController.seekAsync(newPosition);
        } else if (this.nowPlayingInfoCenter) {
          await this.nowPlayingInfoCenter.seekAsync(newPosition);
        } else {
          // Fallback to expo-av
          try {
            await Audio.setPositionAsync(newPosition);
          } catch (seekError) {
            console.warn('Could not seek to position, continuing with resume:', seekError);
          }
        }
      }

      if (this.mediaController) {
        await this.mediaController.playAsync();
        this.isExternalAudioPlaying = true;
        return true;
      } else if (this.nowPlayingInfoCenter) {
        await this.nowPlayingInfoCenter.playAsync();
        this.isExternalAudioPlaying = true;
        return true;
      }

      // Fallback to expo-av
      await Audio.setIsPlayingAsync(true);
      this.isExternalAudioPlaying = true;
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
          if (this.mediaController) {
            await this.mediaController.setVolumeAsync(volume);
          } else if (this.nowPlayingInfoCenter) {
            await this.nowPlayingInfoCenter.setVolumeAsync(volume);
          } else {
            await Audio.setVolumeAsync(volume);
          }
        } catch (volumeError) {
          console.warn('Volume control not supported, skipping fade:', volumeError);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      const paused = await this.pauseSystemAudio();

      try {
        if (this.mediaController) {
          await this.mediaController.setVolumeAsync(1.0);
        } else if (this.nowPlayingInfoCenter) {
          await this.nowPlayingInfoCenter.setVolumeAsync(1.0);
        } else {
          await Audio.setVolumeAsync(1.0);
        }
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

  public cleanup() {
    if (this.mediaController) {
      this.mediaController.removeEventListener('play', this.handlePlayEvent);
      this.mediaController.removeEventListener('pause', this.handlePauseEvent);
      this.mediaController.removeEventListener('seek', this.handleSeekEvent);
    }

    if (this.nowPlayingInfoCenter) {
      this.nowPlayingInfoCenter.removeEventListener('playbackStateDidChange', this.handlePlaybackStateChange);
    }
  }
}
