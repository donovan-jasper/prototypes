import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async () => {
  const location = await Location.getCurrentPositionAsync({});
  return location;
};

export const shareLocationViaSMS = async (contacts) => {
  const location = await getCurrentLocation();
  const message = `Emergency! My current location is: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
  // Send SMS to contacts
};
