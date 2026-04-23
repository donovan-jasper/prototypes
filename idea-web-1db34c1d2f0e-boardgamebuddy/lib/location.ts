import * as Location from 'expo-location';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (pointB.latitude - pointA.latitude) * Math.PI / 180;
  const dLon = (pointB.longitude - pointA.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pointA.latitude * Math.PI / 180) * Math.cos(pointB.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Convert to miles
  return distance * 0.621371;
};

// Check if a point is within a radius of another point
export const isWithinRadius = (
  center: { latitude: number; longitude: number },
  point: { latitude: number; longitude: number },
  radius: number // in miles
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radius;
};

// Get current location with permission handling
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};
