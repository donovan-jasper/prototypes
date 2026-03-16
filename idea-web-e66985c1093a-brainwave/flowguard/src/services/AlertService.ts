import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { AlertConfig } from '../types';

export class AlertService {
  private soundObject: Audio.Sound | null = null;
  private alertLevel: number = 0;
  private escalationInterval: number = 5000; // 5 seconds between escalation levels
  private escalationTimeout: NodeJS.Timeout | null = null;

  async triggerAlert(config: AlertConfig): Promise<void> {
    // Reset alert level
    this.alertLevel = 0;

    // Start escalation
    this.escalateAlert(config);
  }

  private async escalateAlert(config: AlertConfig): Promise<void> {
    // Clear any existing timeout
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
    }

    // Trigger appropriate alert based on level
    switch (this.alertLevel) {
      case 0:
        await this.triggerLevel1Alert(config);
        break;
      case 1:
        await this.triggerLevel2Alert(config);
        break;
      case 2:
        await this.triggerLevel3Alert(config);
        break;
    }

    // Increment alert level (max 2)
    if (this.alertLevel < 2) {
      this.alertLevel++;
      this.escalationTimeout = setTimeout(() => this.escalateAlert(config), this.escalationInterval);
    }
  }

  private async triggerLevel1Alert(config: AlertConfig): Promise<void> {
    if (config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    if (config.soundEnabled) {
      await this.playSound('gentle-chime.mp3');
    }
  }

  private async triggerLevel2Alert(config: AlertConfig): Promise<void> {
    if (config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (config.soundEnabled) {
      await this.playSound('alert-pulse.mp3');
    }
  }

  private async triggerLevel3Alert(config: AlertConfig): Promise<void> {
    if (config.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Add a strong vibration pattern
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (config.soundEnabled) {
      await this.playSound('alert-pulse.mp3');
    }
  }

  private async playSound(soundFile: string): Promise<void> {
    // Unload any existing sound
    if (this.soundObject) {
      await this.soundObject.unloadAsync();
    }

    // Load and play the sound
    this.soundObject = new Audio.Sound();
    try {
      await this.soundObject.loadAsync(require(`../../assets/sounds/${soundFile}`));
      await this.soundObject.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async stopAlert(): Promise<void> {
    // Clear escalation timeout
    if (this.escalationTimeout) {
      clearTimeout(this.escalationTimeout);
      this.escalationTimeout = null;
    }

    // Stop any playing sound
    if (this.soundObject) {
      await this.soundObject.stopAsync();
      await this.soundObject.unloadAsync();
      this.soundObject = null;
    }

    // Reset alert level
    this.alertLevel = 0;
  }
}
