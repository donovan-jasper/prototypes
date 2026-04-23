import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

export class AlertService {
  private soundObjects: { [key: number]: Audio.Sound } = {};
  private currentSound: Audio.Sound | null = null;

  constructor() {
    this.loadSounds();
  }

  async loadSounds(): Promise<void> {
    try {
      // Load different alert sounds for each level
      this.soundObjects[1] = (await Audio.Sound.createAsync(
        require('../../assets/sounds/gentle-chime.mp3')
      )).sound;

      this.soundObjects[2] = (await Audio.Sound.createAsync(
        require('../../assets/sounds/alert-pulse.mp3')
      )).sound;

      this.soundObjects[3] = (await Audio.Sound.createAsync(
        require('../../assets/sounds/strong-alert.mp3')
      )).sound;

      this.soundObjects[4] = (await Audio.Sound.createAsync(
        require('../../assets/sounds/emergency-alert.mp3')
      )).sound;
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async triggerAlert(level: number): Promise<void> {
    // Stop any currently playing sound
    if (this.currentSound) {
      await this.currentSound.stopAsync();
      this.currentSound.unloadAsync();
      this.currentSound = null;
    }

    // Play haptic feedback based on alert level
    switch (level) {
      case 1:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 2:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 3:
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Vibration.vibrate([0, 500, 200, 500], false);
        break;
      case 4:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate([0, 1000, 500, 1000, 500, 1000], false);
        break;
    }

    // Play corresponding sound
    if (this.soundObjects[level]) {
      this.currentSound = this.soundObjects[level];
      await this.currentSound.playAsync();
    }
  }

  async cleanup(): Promise<void> {
    // Unload all sound objects
    for (const level in this.soundObjects) {
      if (this.soundObjects[level]) {
        await this.soundObjects[level].unloadAsync();
      }
    }
  }
}
