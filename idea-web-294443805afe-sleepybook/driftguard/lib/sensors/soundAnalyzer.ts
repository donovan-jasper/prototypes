import { Audio } from 'expo-av';

export const analyzeSound = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      return 0;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    // Wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    await recording.stopAndUnloadAsync();
    const { sound } = await recording.createNewLoadedSoundAsync();

    // Calculate RMS amplitude (simplified)
    const rms = Math.sqrt(sound.getDurationMillis() / 1000);
    const dB = 20 * Math.log10(rms);

    return dB;
  } catch (error) {
    console.error('Error analyzing sound:', error);
    return 0;
  }
};
