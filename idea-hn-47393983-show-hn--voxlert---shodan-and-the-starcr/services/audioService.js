import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const CHARACTER_VOICES = {
  default: {
    ios: 'com.apple.ttsbundle.siri_female_en-US_compact',
    android: 'en-us-x-sfg#female_2-local'
  },
  sciFi: {
    ios: 'com.apple.ttsbundle.siri_female_en-US_compact',
    android: 'en-us-x-sfg#female_2-local'
  },
  gaming: {
    ios: 'com.apple.ttsbundle.siri_male_en-US_compact',
    android: 'en-us-x-sfg#male_2-local'
  },
  friendly: {
    ios: 'com.apple.ttsbundle.siri_female_en-US_compact',
    android: 'en-us-x-sfg#female_2-local'
  },
  professional: {
    ios: 'com.apple.ttsbundle.siri_male_en-US_compact',
    android: 'en-us-x-sfg#male_2-local'
  }
};

export const playNarration = async (text, characterVoice = 'default', options = {}) => {
  try {
    // Stop any currently playing speech
    Speech.stop();

    // Get the appropriate voice identifier based on platform
    const voiceIdentifier = Platform.select({
      ios: CHARACTER_VOICES[characterVoice]?.ios || CHARACTER_VOICES.default.ios,
      android: CHARACTER_VOICES[characterVoice]?.android || CHARACTER_VOICES.default.android
    });

    // Configure speech options with user settings
    const speechOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: options.rate || 1.0,
      voice: voiceIdentifier
    };

    // Speak the text
    Speech.speak(text, speechOptions);

    // Set volume if available (note: volume control is limited in expo-speech)
    if (options.volume !== undefined) {
      // This is a workaround since expo-speech doesn't support volume directly
      // In a production app, you might need to use a different audio library
      console.log(`Volume setting would be applied here: ${options.volume}`);
    }

    return true;
  } catch (error) {
    console.error('Error playing narration:', error);
    return false;
  }
};

export const generateVoiceSample = async (characterVoice = 'default', options = {}) => {
  try {
    const sampleText = "Hello, this is a sample of your selected voice.";
    await playNarration(sampleText, characterVoice, options);
    return true;
  } catch (error) {
    console.error('Error generating voice sample:', error);
    return false;
  }
};

export const stopNarration = () => {
  Speech.stop();
};
