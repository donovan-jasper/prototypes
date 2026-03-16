import * as Location from 'expo-location';

export const detectLocationContext = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return 'unknown';
  }

  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;

  // Mock location detection (replace with actual geofencing)
  if (latitude > 37.7749 && latitude < 37.7751 && longitude > -122.4194 && longitude < -122.4196) {
    return 'home';
  } else if (latitude > 37.7749 && latitude < 37.7751 && longitude > -122.4194 && longitude < -122.4196) {
    return 'work';
  } else {
    return 'other';
  }
};
