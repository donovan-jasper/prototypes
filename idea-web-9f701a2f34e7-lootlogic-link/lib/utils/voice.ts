import * as Speech from 'expo-speech';

interface VoiceCommand {
  action: string;
  game?: string;
  loadout?: string;
}

export const parseVoiceCommand = (command: string): VoiceCommand | null => {
  if (command.includes('show inventory')) {
    const game = command.split('show inventory')[1].trim();
    return { action: 'showInventory', game };
  } else if (command.includes('load')) {
    const loadout = command.split('load')[1].trim();
    return { action: 'loadLoadout', loadout };
  }
  return null;
};

export const speak = (text: string): void => {
  Speech.speak(text);
};
