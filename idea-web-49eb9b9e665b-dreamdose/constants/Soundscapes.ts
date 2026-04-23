import { Audio } from 'expo-av';

export interface Soundscape {
  id: string;
  name: string;
  description: string;
  file: any; // Audio file reference
  isPremium: boolean;
}

export const Soundscapes: Soundscape[] = [
  {
    id: 'rain',
    name: 'Rain',
    description: 'Calming rain sounds',
    file: require('../assets/sounds/rain.mp3'),
    isPremium: false,
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Relaxing ocean sounds',
    file: require('../assets/sounds/ocean.mp3'),
    isPremium: true,
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Nature sounds from the woods',
    file: require('../assets/sounds/forest.mp3'),
    isPremium: true,
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    description: 'Smooth white noise',
    file: require('../assets/sounds/white-noise.mp3'),
    isPremium: false,
  },
  {
    id: 'binaural',
    name: 'Binaural Beats',
    description: 'Theta wave binaural beats',
    file: require('../assets/sounds/binaural.mp3'),
    isPremium: true,
  },
];
