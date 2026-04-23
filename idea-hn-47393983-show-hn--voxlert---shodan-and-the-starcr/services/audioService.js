import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getCurrentCharacter } from '../utils/helpers';

let currentSound = null;

const playNarration = async (text, character = null) => {
  try {
    // Stop any currently playing sound
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const selectedCharacter = character || await getCurrentCharacter();

    // Use text-to-speech for default character
    if (selectedCharacter === 'default') {
      Speech.speak(text, {
        language: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        onStart: () => console.log('Speech started'),
        onDone: () => console.log('Speech finished'),
        onStopped: () => console.log('Speech stopped'),
        onError: (error) => console.error('Speech error:', error)
      });
      return true;
    }

    // For other characters, use pre-recorded audio files
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(
        require(`../assets/voices/${selectedCharacter}.mp3`),
        { shouldPlay: true }
      );
      currentSound = soundObject;
      return true;
    } catch (error) {
      console.error('Error loading character voice:', error);
      // Fallback to text-to-speech if character voice fails
      Speech.speak(text, {
        language: 'en-US',
        rate: 1.0,
        pitch: 1.0
      });
      return false;
    }
  } catch (error) {
    console.error('Error in playNarration:', error);
    return false;
  }
};

const generateVoiceSample = async (character) => {
  try {
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync(
      require(`../assets/voices/${character}_sample.mp3`),
      { shouldPlay: true }
    );
    return true;
  } catch (error) {
    console.error('Error generating voice sample:', error);
    return false;
  }
};

const stopAllAudio = async () => {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }
    Speech.stop();
    return true;
  } catch (error) {
    console.error('Error stopping audio:', error);
    return false;
  }
};

export {
  playNarration,
  generateVoiceSample,
  stopAllAudio
};
