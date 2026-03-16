import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverseGeocode.length === 0) {
      throw new Error('No location data found');
    }

    const { city, region } = reverseGeocode[0];
    return { city, region };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};
