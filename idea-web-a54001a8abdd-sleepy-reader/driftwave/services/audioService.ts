import { Audio } from 'expo-av';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSleepStore } from '../store/useSleepStore';

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentVolume: number = 1.0;
  private isTransitioning: boolean = false;

  async loadContent(contentId: string): Promise<void> {
    try {
      // In a real app, this would load the actual audio file
      // For this prototype, we'll just simulate loading
      console.log(`Loading content: ${contentId}`);

      // Unload any currently loaded sound
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Create a new sound object
      this.sound = new Audio.Sound();

      // Load the sound (simulated with a placeholder)
      await this.sound.loadAsync(
        require('../assets/audio/placeholder.mp3'),
        { shouldPlay: false }
      );

      // Set initial volume
      await this.sound.setVolumeAsync(this.currentVolume);

      // Update player store
      usePlayerStore.getState().setCurrentContent({
        id: contentId,
        title: contentId.replace(/-/g, ' '),
        image: 'https://via.placeholder.com/300',
      });
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
      usePlayerStore.getState().setIsPlaying(true);
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
      usePlayerStore.getState().setIsPlaying(false);
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      usePlayerStore.getState().setIsPlaying(false);
    }
  }

  async adjustForSleepStage(sleepStage: string): Promise<void> {
    if (this.isTransitioning) return;

    let targetVolume = 1.0;
    let targetPlaybackRate = 1.0;

    switch (sleepStage) {
      case 'awake':
        targetVolume = 1.0;
        targetPlaybackRate = 1.0;
        break;
      case 'light':
        targetVolume = 0.7;
        targetPlaybackRate = 0.9;
        break;
      case 'deep':
        targetVolume = 0.3;
        targetPlaybackRate = 0.8;
        break;
    }

    // Smooth transition to new volume and playback rate
    this.isTransitioning = true;

    if (this.sound) {
      // Volume transition
      const volumeSteps = 10;
      const volumeStep = (targetVolume - this.currentVolume) / volumeSteps;

      for (let i = 0; i < volumeSteps; i++) {
        this.currentVolume += volumeStep;
        await this.sound.setVolumeAsync(this.currentVolume);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Playback rate transition (simulated with pitch adjustment)
      // In a real app, you would use a proper audio processing library
      console.log(`Adjusting playback rate to ${targetPlaybackRate}`);
    }

    this.isTransitioning = false;
  }

  async transitionTo(contentId: string): Promise<number> {
    // Simulate a smooth transition between content types
    const transitionDuration = 3000; // 3 seconds

    // Fade out current content
    if (this.sound) {
      await this.sound.setVolumeAsync(0, transitionDuration);
    }

    // Load new content
    await this.loadContent(contentId);

    // Fade in new content
    if (this.sound) {
      await this.sound.setVolumeAsync(this.currentVolume, transitionDuration);
    }

    return transitionDuration;
  }

  getCurrentVolume(): number {
    return this.currentVolume;
  }
}

export const audioService = new AudioService();
