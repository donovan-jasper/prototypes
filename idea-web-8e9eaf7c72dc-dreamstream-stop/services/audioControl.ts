import { Audio } from 'expo-av';
import { MediaControl } from 'expo-media-library';
import * as Notifications from 'expo-notifications';

class AudioController {
  private currentPlaybackObject: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private playbackPosition: number = 0;
  private fadeDuration: number = 3000; // 3 seconds
  private notificationId: string | null = null;

  constructor() {
    this.setupMediaControls();
    this.setupNotifications();
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

  private setupNotifications() {
    // Request notification permissions
    Notifications.requestPermissionsAsync();

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }

  private async showNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: false,
      },
      trigger: null,
    });
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

      // Show notification
      this.notificationId = await this.showNotification(
        'SleepCue',
        'Audio paused because you fell asleep. Tap to resume.'
      );

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

      // Cancel any existing notification
      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
        this.notificationId = null;
      }

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

  public async handleNotificationResponse(response: Notifications.NotificationResponse) {
    if (response.notification.request.identifier === this.notificationId) {
      await this.resumePlayback();
    }
  }
}

export const audioController = new AudioController();
