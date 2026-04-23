import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      maximumAge: 10000,
      timeout: 15000
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  // Haversine formula to calculate distance between two coordinates in km
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (value: number) => {
  return value * Math.PI / 180;
};

export const startBackgroundLocationUpdates = async () => {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Background location permission denied');
    }

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // 1 minute
      distanceInterval: 100, // 100 meters
      deferredUpdatesInterval: 60000, // 1 minute
      deferredUpdatesDistance: 100, // 100 meters
      showsBackgroundLocationIndicator: true,
    });

    console.log('Background location updates started');
  } catch (error) {
    console.error('Error starting background location updates:', error);
    throw error;
  }
};

export const stopBackgroundLocationUpdates = async () => {
  try {
    await Location.stopLocationUpdatesAsync('background-location-task');
    console.log('Background location updates stopped');
  } catch (error) {
    console.error('Error stopping background location updates:', error);
    throw error;
  }
};
