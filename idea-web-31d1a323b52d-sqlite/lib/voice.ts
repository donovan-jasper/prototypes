import * as Speech from 'expo-speech';

export const startListening = () => {
  return new Promise((resolve, reject) => {
    // Mock implementation for voice recognition
    setTimeout(() => {
      resolve('Sample voice command');
    }, 2000);
  });
};

export const speak = (text) => {
  Speech.speak(text);
};
