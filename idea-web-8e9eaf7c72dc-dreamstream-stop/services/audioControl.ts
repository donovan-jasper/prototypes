import { Audio } from 'expo-av';
import { MediaControl } from 'expo-media-library';

class AudioController {
  private currentPlaybackObject: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private playbackPosition: number = 0;
  private fadeDuration: number = 3000; // 3 seconds

  constructor() {
    this.setupMediaControls();
  }

  private setupMediaControls() {
    // Set up system media controls
    MediaControl.setNowPlaying({
      title: 'SleepCue',
      artist: 'Audio Detection',
      isPlaying: false,
      rating: 100,
      duration: 0,
      elapsedTime: 0,
    });

    // Handle media control events
    MediaControl.onPlayPress(() => this.resumePlayback());
    MediaControl.onPausePress(() => this.pausePlayback());
    MediaControl.onStopPress(() => this.pausePlayback());
    MediaControl.onPreviousPress(() => this.rewind(30000)); // 30 seconds
    MediaControl.onNextPress(() => this.fastForward(30000)); // 30 seconds
  }

  public async pausePlayback() {
    if (this.currentPlaybackObject && this.isPlaying) {
      // Fade out before pausing
      await this.currentPlaybackObject.setVolumeAsync(0, this.fadeDuration);
      await this.currentPlaybackObject.pauseAsync();
      this.isPlaying = false;

      // Update media controls
      MediaControl.setNowPlaying({
        isPlaying: false,
      });

      console.log('Playback paused');
    }
  }

  public async resumePlayback(rewindMs: number = 0) {
    if (this.currentPlaybackObject) {
      // Rewind if requested
      if (rewindMs > 0) {
        const status = await this.currentPlaybackObject.getStatusAsync();
        if (status.positionMillis) {
          const newPosition = Math.max(0, status.positionMillis - rewindMs);
          await this.currentPlaybackObject.setPositionAsync(newPosition);
        }
      }

      // Fade in when resuming
      await this.currentPlaybackObject.setVolumeAsync(1, this.fadeDuration);
      await this.currentPlaybackObject.playAsync();
      this.isPlaying = true;

      // Update media controls
      MediaControl.setNowPlaying({
        isPlaying: true,
      });

      console.log('Playback resumed');
    }
  }

  public async rewind(ms: number) {
    if (this.currentPlaybackObject) {
      const status = await this.currentPlaybackObject.getStatusAsync();
      if (status.positionMillis) {
        const newPosition = Math.max(0, status.positionMillis - ms);
        await this.currentPlaybackObject.setPositionAsync(newPosition);
      }
    }
  }

  public async fastForward(ms: number) {
    if (this.currentPlaybackObject) {
      const status = await this.currentPlaybackObject.getStatusAsync();
      if (status.durationMillis && status.positionMillis) {
        const newPosition = Math.min(status.durationMillis, status.positionMillis + ms);
        await this.currentPlaybackObject.setPositionAsync(newPosition);
      }
    }
  }

  public async setFadeDuration(ms: number) {
    this.fadeDuration = Math.max(500, Math.min(5000, ms)); // Limit to 0.5-5 seconds
  }

  public async getPlaybackStatus() {
    if (this.currentPlaybackObject) {
      return await this.currentPlaybackObject.getStatusAsync();
    }
    return null;
  }

  public async setPlaybackObject(sound: Audio.Sound) {
    this.currentPlaybackObject = sound;
    this.isPlaying = true;
  }
}

export const audioController = new AudioController();
