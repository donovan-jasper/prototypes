import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Gets the current location of the device
 * @returns Promise with latitude and longitude
 */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

/**
 * Calculates distance between two coordinates in miles
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in miles
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // Haversine formula
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) *
    Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance for display
 * @param distance Distance in miles
 * @returns Formatted string
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return '<0.1 mi';
  }
  return `${distance.toFixed(1)} mi`;
}

/**
 * Checks if a point is within a radius of another point
 * @param center Center point
 * @param point Point to check
 * @param radius Radius in miles
 * @returns True if point is within radius
 */
export function isWithinRadius(
  center: { lat: number; lng: number },
  point: { lat: number; lng: number },
  radius: number
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radius;
}
