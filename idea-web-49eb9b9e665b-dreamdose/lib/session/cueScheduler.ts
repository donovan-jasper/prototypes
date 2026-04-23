import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { calculateNextCueTime, getCueIntensity } from './adaptiveAlgorithm';
import { logCueEvent } from '../database/queries';
import { Session } from './sessionManager';

class CueScheduler {
  private session: Session | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private elapsedMinutes = 0;
  private lastCueTime = 0;
  private soundObject: Audio.Sound | null = null;

  initialize(session: Session) {
    this.session = session;
    this.elapsedMinutes = 0;
    this.lastCueTime = Date.now();
  }

  start() {
    if (!this.session) return;

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - this.session!.startTime) / 1000;
      this.elapsedMinutes = Math.floor(elapsedSeconds / 60);

      const timeSinceLastCue = (now - this.lastCueTime) / 1000;
      const nextCueTime = calculateNextCueTime(this.elapsedMinutes, this.session!.durationMinutes);

      if (timeSinceLastCue >= nextCueTime) {
        this.triggerCue();
        this.lastCueTime = now;
      }
    }, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume() {
    if (this.session && !this.intervalId) {
      this.start();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cleanupAudio();
  }

  private async triggerCue() {
    if (!this.session) return;

    const intensity = getCueIntensity(this.elapsedMinutes, this.session.durationMinutes);
    const isFinalPhase = this.elapsedMinutes >= this.session.durationMinutes - 2;

    // Determine cue type based on intensity and phase
    let cueType: 'audio' | 'haptic' | 'both' = 'audio';

    if (intensity > 0.7) {
      cueType = 'both';
    } else if (intensity > 0.4) {
      cueType = Math.random() > 0.5 ? 'haptic' : 'audio';
    }

    // Play appropriate feedback
    if (cueType === 'audio' || cueType === 'both') {
      await this.playAudioCue(intensity);
    }

    if (cueType === 'haptic' || cueType === 'both') {
      this.triggerHapticCue(intensity);
    }

    // Log the cue event
    await logCueEvent(
      this.session.id,
      Date.now(),
      cueType,
      intensity
    );
  }

  private async playAudioCue(intensity: number) {
    try {
      // Clean up previous sound if it exists
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/cue.mp3'),
        {
          shouldPlay: true,
          volume: intensity * 0.7, // Scale volume with intensity
        }
      );

      this.soundObject = sound;
    } catch (error) {
      console.log('Error playing audio cue', error);
    }
  }

  private triggerHapticCue(intensity: number) {
    if (intensity < 0.5) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (intensity < 0.8) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  private async cleanupAudio() {
    if (this.soundObject) {
      try {
        await this.soundObject.unloadAsync();
        this.soundObject = null;
      } catch (error) {
        console.log('Error cleaning up audio', error);
      }
    }
  }
}

export const cueScheduler = new CueScheduler();
