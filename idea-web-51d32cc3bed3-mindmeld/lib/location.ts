import * as Location from 'expo-location';

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const isNearLocation = (
  current: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number },
  radiusInMeters: number = 100
) => {
  const R = 6371e3;
  const φ1 = (current.latitude * Math.PI) / 180;
  const φ2 = (target.latitude * Math.PI) / 180;
  const Δφ = ((target.latitude - current.latitude) * Math.PI) / 180;
  const Δλ = ((target.longitude - current.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance <= radiusInMeters;
};
