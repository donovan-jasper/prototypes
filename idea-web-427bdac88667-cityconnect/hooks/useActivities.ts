import { useState, useEffect, useCallback } from 'react';
import { getActivitiesNearby, Activity } from '../lib/activities';
import { useLocation } from './useLocation';

export function useActivities(radiusMiles: number = 1, category?: string) {
  const { location } = useLocation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!location) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getActivitiesNearby(
        location.coords.latitude,
        location.coords.longitude,
        radiusMiles,
        category
      );
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [location, radiusMiles, category]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const refresh = useCallback(() => {
    return fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refresh };
}
