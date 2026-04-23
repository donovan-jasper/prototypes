import { Camera } from 'expo-camera';
import { textToMorse } from './morse';

export class FlashlightService {
  private cameraRef: React.RefObject<Camera>;
  private isActive: boolean = false;

  constructor(cameraRef: React.RefObject<Camera>) {
    this.cameraRef = cameraRef;
  }

  async checkPermissions(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  async sendSOS(message: string = 'SOS'): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;

    try {
      const morse = textToMorse(message);
      const pattern = this.createFlashPattern(morse);

      for (const { duration, intensity } of pattern) {
        if (intensity > 0) {
          await this.cameraRef.current?.setFlashModeAsync('torch');
        } else {
          await this.cameraRef.current?.setFlashModeAsync('off');
        }

        await new Promise(resolve => setTimeout(resolve, duration));
      }
    } finally {
      await this.cameraRef.current?.setFlashModeAsync('off');
      this.isActive = false;
    }
  }

  private createFlashPattern(morse: string): { duration: number; intensity: number }[] {
    const pattern: { duration: number; intensity: number }[] = [];

    for (const char of morse) {
      if (char === '.') {
        pattern.push({ duration: 100, intensity: 1 }); // Dot
      } else if (char === '-') {
        pattern.push({ duration: 300, intensity: 1 }); // Dash
      } else if (char === ' ') {
        pattern.push({ duration: 100, intensity: 0 }); // Space between symbols
      }

      // Add gap between symbols
      pattern.push({ duration: 100, intensity: 0 });
    }

    // Add final pause
    pattern.push({ duration: 500, intensity: 0 });

    return pattern;
  }
}
