import { useState, useEffect, useCallback } from 'react';
import { getActivitiesNearby } from '../lib/activities';
import * as Location from 'expo-location';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useActivities(
  location: Coordinates | undefined,
  radius: number,
  category?: string
) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!location) {
      setLoading(false);
      setError('Location not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedActivities = await getActivitiesNearby(
        location.latitude,
        location.longitude,
        radius,
        category
      );
      setActivities(fetchedActivities);
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [location, radius, category]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refresh = async () => {
    await fetchActivities();
  };

  return { activities, loading, error, refresh };
}
