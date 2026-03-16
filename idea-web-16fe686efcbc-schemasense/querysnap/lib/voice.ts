import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export const startRecording = async () => {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
  await recording.startAsync();

  return recording;
};

export const stopRecording = async (recording) => {
  await recording.stopAndUnloadAsync();
  return recording.getURI();
};

export const transcribeAudio = async (uri) => {
  // Implement audio transcription
};

export const speakResults = (text) => {
  Speech.speak(text);
};
