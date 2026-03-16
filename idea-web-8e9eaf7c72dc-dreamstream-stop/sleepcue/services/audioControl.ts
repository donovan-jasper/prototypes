import { Audio } from 'expo-av';

export class AudioController {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private position: number = 0;
  private duration: number = 0;
  private onPlaybackStatusUpdate: ((status: Audio.AudioPlaybackStatus) => void) | null = null;

  public async play() {
    if (this.isPlaying) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/sample.mp3')
      );
      this.sound = sound;
      await sound.playAsync();
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.position = status.positionMillis;
          this.duration = status.durationMillis || 0;
          if (this.onPlaybackStatusUpdate) {
            this.onPlaybackStatusUpdate(status);
          }
        }
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  public async pause() {
    if (!this.isPlaying || !this.sound) return;

    try {
      await this.sound.pauseAsync();
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }

  public async rewind(seconds: number) {
    if (!this.sound) return;

    try {
      const newPosition = Math.max(0, this.position - seconds * 1000);
      await this.sound.setPositionAsync(newPosition);
      this.position = newPosition;
    } catch (error) {
      console.error('Failed to rewind audio:', error);
    }
  }

  public async fadeOutAndPause(duration: number = 3000) {
    if (!this.sound || !this.isPlaying) return;

    try {
      // Gradually reduce volume
      const steps = 10;
      const interval = duration / steps;
      const currentVolume = 1.0;

      for (let i = steps; i >= 0; i--) {
        const volume = currentVolume * (i / steps);
        await this.sound.setVolumeAsync(volume);
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      // Pause the audio
      await this.pause();
      await this.sound.setVolumeAsync(1.0); // Reset volume
    } catch (error) {
      console.error('Failed to fade out audio:', error);
    }
  }

  public setOnPlaybackStatusUpdate(callback: (status: Audio.AudioPlaybackStatus) => void) {
    this.onPlaybackStatusUpdate = callback;
  }

  public getPlaybackStatus(): Audio.AudioPlaybackStatus | null {
    if (!this.sound) return null;

    return {
      isLoaded: true,
      isPlaying: this.isPlaying,
      positionMillis: this.position,
      durationMillis: this.duration,
      androidImplementation: 'Simple',
      iosImplementation: 'AVPlayer',
    };
  }
}
