import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

let hasPermission = false;

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    hasPermission = status === 'granted';
    return hasPermission;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    hasPermission = status === 'granted';
    return hasPermission;
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}
