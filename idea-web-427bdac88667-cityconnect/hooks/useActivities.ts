import { useState, useEffect, useCallback } from 'react';
import { getActivitiesNearby } from '../lib/activities';
import * as Location from 'expo-location';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  startTime: string;
  organizerId: number;
  maxAttendees: number | null;
}

export function useActivities(
  location: Location.LocationObjectCoords | undefined,
  radius: number,
  category?: string
) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!location) return;

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
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location, radius, category]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refresh = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refresh };
}
