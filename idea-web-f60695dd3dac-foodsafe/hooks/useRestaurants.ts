import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Restaurant, Inspection } from '@/types';
import { getRestaurantsByLocation, getRestaurantDetails, getInspectionsForRestaurant } from '@/services/api';
import { cacheRestaurants, getCachedRestaurants, cacheInspections, getCachedInspections } from '@/services/database';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getRestaurantById: (id: string) => Promise<Restaurant | null>;
  getInspectionsByRestaurantId: (id: string) => Promise<Inspection[]>;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // First try to get from cache
      const cachedRestaurants = await getCachedRestaurants();
      if (cachedRestaurants.length > 0) {
        setRestaurants(cachedRestaurants);
      }

      // Then fetch from API
      const apiRestaurants = await getRestaurantsByLocation(latitude, longitude);
      setRestaurants(apiRestaurants);

      // Cache the results
      await cacheRestaurants(apiRestaurants);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch restaurants'));
      console.error('Error fetching restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRestaurantById = useCallback(async (id: string): Promise<Restaurant | null> => {
    try {
      // First try to get from cache
      const cachedRestaurants = await getCachedRestaurants();
      const cachedRestaurant = cachedRestaurants.find(r => r.id === id);
      if (cachedRestaurant) {
        return cachedRestaurant;
      }

      // If not in cache, fetch from API
      const restaurant = await getRestaurantDetails(id);
      await cacheRestaurants([restaurant]);
      return restaurant;
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      return null;
    }
  }, []);

  const getInspectionsByRestaurantId = useCallback(async (id: string): Promise<Inspection[]> => {
    try {
      // First try to get from cache
      const cachedInspections = await getCachedInspections(id);
      if (cachedInspections.length > 0) {
        return cachedInspections;
      }

      // If not in cache, fetch from API
      const inspections = await getInspectionsForRestaurant(id);
      await cacheInspections(inspections);
      return inspections;
    } catch (err) {
      console.error('Error fetching inspections:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    isLoading,
    error,
    refresh: fetchRestaurants,
    getRestaurantById,
    getInspectionsByRestaurantId,
  };
};
