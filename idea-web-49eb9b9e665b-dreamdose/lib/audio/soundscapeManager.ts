import { Audio } from 'expo-av';
import { Soundscapes, Soundscape } from '../../constants/Soundscapes';

class SoundscapeManager {
  private ambientSound: Audio.Sound | null = null;
  private currentSoundscape: Soundscape | null = null;

  async loadSoundscape(soundscapeId: string): Promise<boolean> {
    const soundscape = Soundscapes.find(s => s.id === soundscapeId);
    if (!soundscape) return false;

    try {
      // Unload previous soundscape if it exists
      if (this.ambientSound) {
        await this.ambientSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        soundscape.file,
        {
          isLooping: true,
          volume: 0.5, // Start with moderate volume
        }
      );

      this.ambientSound = sound;
      this.currentSoundscape = soundscape;
      return true;
    } catch (error) {
      console.log('Error loading soundscape', error);
      return false;
    }
  }

  async playAmbient(): Promise<void> {
    if (this.ambientSound) {
      try {
        await this.ambientSound.playAsync();
      } catch (error) {
        console.log('Error playing ambient sound', error);
      }
    }
  }

  async playCue(intensity: number): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/cue.mp3'),
        {
          shouldPlay: true,
          volume: intensity * 0.7, // Scale volume with intensity
        }
      );

      // Clean up after playback
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing cue sound', error);
    }
  }

  async stopAll(): Promise<void> {
    if (this.ambientSound) {
      try {
        await this.ambientSound.stopAsync();
        await this.ambientSound.unloadAsync();
        this.ambientSound = null;
        this.currentSoundscape = null;
      } catch (error) {
        console.log('Error stopping soundscape', error);
      }
    }
  }

  getCurrentSoundscape(): Soundscape | null {
    return this.currentSoundscape;
  }
}

export const soundscapeManager = new SoundscapeManager();
