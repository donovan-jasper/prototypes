import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define available voices with their characteristics
const VOICE_PROFILES = {
  default: {
    name: 'Default',
    rate: 1.0,
    pitch: 1.0,
    voice: null // Uses system default
  },
  professional: {
    name: 'Professional',
    rate: 0.9,
    pitch: 1.0,
    voice: null
  },
  friendly: {
    name: 'Friendly',
    rate: 1.1,
    pitch: 1.1,
    voice: null
  },
  gaming: {
    name: 'Gaming Hero',
    rate: 1.0,
    pitch: 0.9,
    voice: null
  },
  sciFi: {
    name: 'Sci-Fi Commander',
    rate: 0.8,
    pitch: 0.8,
    voice: null
  }
};

// Function to get available voices from the system
const getSystemVoices = async () => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices || [];
  } catch (error) {
    console.warn('Could not fetch system voices:', error);
    return [];
  }
};

// Initialize voice profiles with system voices if available
const initializeVoiceProfiles = async () => {
  const systemVoices = await getSystemVoices();
  
  // Map system voices to our profiles if available
  const updatedProfiles = { ...VOICE_PROFILES };
  
  // For now, we'll just return the default profiles
  // In a real implementation, we'd match system voices to our profiles
  return updatedProfiles;
};

export const playNarration = async (text, voiceType = 'default') => {
  try {
    // Validate inputs
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to playNarration');
      return false;
    }

    // Get voice profile
    const voiceProfiles = await initializeVoiceProfiles();
    const selectedVoice = voiceProfiles[voiceType] || voiceProfiles.default;

    // Stop any currently playing speech
    Speech.stop();

    // Configure speech options
    const speechOptions = {
      language: 'en-US',
      pitch: selectedVoice.pitch,
      rate: selectedVoice.rate,
      onStart: () => console.log('Speech started'),
      onDone: () => console.log('Speech completed'),
      onError: (error) => console.error('Speech error:', error),
    };

    // Add voice if available
    if (selectedVoice.voice) {
      speechOptions.voice = selectedVoice.voice;
    }

    // Speak the text
    Speech.speak(text, speechOptions);

    return true;
  } catch (error) {
    console.error('Error in playNarration:', error);
    return false;
  }
};

export const stopNarration = () => {
  try {
    Speech.stop();
    return true;
  } catch (error) {
    console.error('Error stopping narration:', error);
    return false;
  }
};

export const pauseNarration = () => {
  try {
    // Expo Speech doesn't have a direct pause method
    // We'll stop the current speech instead
    Speech.stop();
    return true;
  } catch (error) {
    console.error('Error pausing narration:', error);
    return false;
  }
};

export const getAvailableVoices = async () => {
  try {
    const systemVoices = await getSystemVoices();
    const voiceProfiles = await initializeVoiceProfiles();
    
    // Return both system voices and our predefined profiles
    return {
      systemVoices,
      profiles: voiceProfiles
    };
  } catch (error) {
    console.error('Error getting available voices:', error);
    return { systemVoices: [], profiles: {} };
  }
};

export const saveCustomVoice = async (voiceName, voiceData) => {
  try {
    const key = `custom_voice_${voiceName}`;
    await AsyncStorage.setItem(key, JSON.stringify(voiceData));
    return true;
  } catch (error) {
    console.error('Error saving custom voice:', error);
    return false;
  }
};

export const loadCustomVoice = async (voiceName) => {
  try {
    const key = `custom_voice_${voiceName}`;
    const voiceData = await AsyncStorage.getItem(key);
    return voiceData ? JSON.parse(voiceData) : null;
  } catch (error) {
    console.error('Error loading custom voice:', error);
    return null;
  }
};
