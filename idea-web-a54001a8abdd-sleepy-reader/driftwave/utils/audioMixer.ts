import { Audio } from 'expo-av';

export class AudioMixer {
  private sounds: { [key: string]: Audio.Sound } = {};
  private volumes: { [key: string]: number } = {};
  private isTransitioning: boolean = false;

  async loadSound(key: string, uri: string): Promise<void> {
    if (this.sounds[key]) {
      await this.sounds[key].unloadAsync();
    }

    this.sounds[key] = new Audio.Sound();
    await this.sounds[key].loadAsync({ uri }, { shouldPlay: false });
    this.volumes[key] = 1.0;
  }

  async playSound(key: string): Promise<void> {
    if (this.sounds[key]) {
      await this.sounds[key].playAsync();
    }
  }

  async pauseSound(key: string): Promise<void> {
    if (this.sounds[key]) {
      await this.sounds[key].pauseAsync();
    }
  }

  async stopSound(key: string): Promise<void> {
    if (this.sounds[key]) {
      await this.sounds[key].stopAsync();
    }
  }

  async setVolume(key: string, volume: number): Promise<void> {
    if (this.sounds[key]) {
      await this.sounds[key].setVolumeAsync(volume);
      this.volumes[key] = volume;
    }
  }

  async crossfade(fromKey: string, toKey: string, duration: number = 3000): Promise<void> {
    if (this.isTransitioning || !this.sounds[fromKey] || !this.sounds[toKey]) {
      return;
    }

    this.isTransitioning = true;

    // Start playing the target sound if not already playing
    if (!(await this.sounds[toKey].getStatusAsync()).isPlaying) {
      await this.sounds[toKey].playAsync();
    }

    // Fade out the current sound
    const fadeOutSteps = 10;
    const fadeOutStep = this.volumes[fromKey] / fadeOutSteps;
    const fadeInStep = this.volumes[toKey] / fadeOutSteps;

    for (let i = 0; i < fadeOutSteps; i++) {
      const currentVolume = this.volumes[fromKey] - fadeOutStep * (i + 1);
      const targetVolume = this.volumes[toKey] + fadeInStep * (i + 1);

      await this.sounds[fromKey].setVolumeAsync(currentVolume);
      await this.sounds[toKey].setVolumeAsync(targetVolume);

      await new Promise(resolve => setTimeout(resolve, duration / fadeOutSteps));
    }

    // Stop the current sound
    await this.sounds[fromKey].stopAsync();
    await this.sounds[fromKey].setVolumeAsync(this.volumes[fromKey]);

    this.isTransitioning = false;
  }

  async adjustForSleepStage(sleepStage: string): Promise<void> {
    if (this.isTransitioning) return;

    // Get all active sounds
    const activeSounds = Object.keys(this.sounds).filter(key => {
      return this.sounds[key].getStatusAsync().then(status => status.isPlaying);
    });

    // Adjust volume based on sleep stage
    for (const key of activeSounds) {
      let targetVolume = 1.0;

      switch (sleepStage) {
        case 'awake':
          targetVolume = 1.0;
          break;
        case 'light':
          targetVolume = 0.7;
          break;
        case 'deep':
          targetVolume = 0.3;
          break;
      }

      // Smooth transition to new volume
      const currentVolume = this.volumes[key];
      const volumeSteps = 10;
      const volumeStep = (targetVolume - currentVolume) / volumeSteps;

      for (let i = 0; i < volumeSteps; i++) {
        const newVolume = currentVolume + volumeStep * (i + 1);
        await this.sounds[key].setVolumeAsync(newVolume);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.volumes[key] = targetVolume;
    }
  }
}

export const audioMixer = new AudioMixer();
