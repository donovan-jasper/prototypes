import { Brightness } from 'expo-brightness';

export const measureLight = async () => {
  try {
    const { status } = await Brightness.requestPermissionsAsync();
    if (status !== 'granted') {
      return 0;
    }

    const brightness = await Brightness.getBrightnessAsync();
    const lux = brightness * 1000; // Convert to lux (approximate)

    return lux;
  } catch (error) {
    console.error('Error measuring light:', error);
    return 0;
  }
};
