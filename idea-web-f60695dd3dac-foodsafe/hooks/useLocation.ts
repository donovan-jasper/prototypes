import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationResult {
  location: Location.LocationObject | null;
  isLoading: boolean;
  error: string | null;
}

export const useLocation = (): LocationResult => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission not granted');
        }

        // Get current position
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation(currentLocation);
          setError(null);
        }
      } catch (err) {
        console.error('Error getting location:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to get location');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, isLoading, error };
};
