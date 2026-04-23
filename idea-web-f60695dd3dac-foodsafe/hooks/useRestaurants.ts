import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Restaurant, Inspection } from '@/types';
import { getRestaurantsByLocation, searchRestaurants, getRestaurantById, getInspectionHistory } from '@/services/api';
import { cacheRestaurant, cacheInspections, getCachedRestaurants, getCachedInspections, initDatabase, clearOldCache } from '@/services/database';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  getRestaurantDetails: (id: string) => Promise<Restaurant | null>;
  getInspectionHistory: (restaurantId: string) => Promise<Inspection[]>;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on first render
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await clearOldCache();
      } catch (err) {
        console.error('Database initialization failed:', err);
      }
    };
    initialize();
  }, []);

  // Load restaurants based on current location
  const loadRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // First try to get cached data
      const cachedRestaurants = await getCachedRestaurants();
      if (cachedRestaurants.length > 0) {
        setRestaurants(cachedRestaurants);
      }

      // Then fetch fresh data from API
      const freshRestaurants = await getRestaurantsByLocation(latitude, longitude);

      // Update state with fresh data
      setRestaurants(freshRestaurants);

      // Cache the fresh data
      await Promise.all(freshRestaurants.map(restaurant => cacheRestaurant(restaurant)));

    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');

      // If API fails, try to load from cache
      try {
        const cachedRestaurants = await getCachedRestaurants();
        if (cachedRestaurants.length > 0) {
          setRestaurants(cachedRestaurants);
        }
      } catch (cacheErr) {
        console.error('Error loading cached restaurants:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadRestaurants();
  }, [loadRestaurants]);

  // Search for restaurants
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadRestaurants();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First try to get cached data
      const cachedRestaurants = await getCachedRestaurants();
      const cachedResults = cachedRestaurants.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
      );

      if (cachedResults.length > 0) {
        setRestaurants(cachedResults);
      }

      // Then fetch fresh data from API
      const freshResults = await searchRestaurants(query);
      setRestaurants(freshResults);

      // Cache the fresh data
      await Promise.all(freshResults.map(restaurant => cacheRestaurant(restaurant)));

    } catch (err) {
      console.error('Error searching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Failed to search restaurants');

      // If API fails, try to load from cache
      try {
        const cachedRestaurants = await getCachedRestaurants();
        const cachedResults = cachedRestaurants.filter(
          restaurant =>
            restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
        );
        setRestaurants(cachedResults);
      } catch (cacheErr) {
        console.error('Error loading cached search results:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadRestaurants]);

  // Get restaurant details
  const getRestaurantDetails = useCallback(async (id: string): Promise<Restaurant | null> => {
    try {
      // First try to get from cache
      const cachedRestaurant = await getRestaurantById(id);
      if (cachedRestaurant) {
        return cachedRestaurant;
      }

      // If not in cache, fetch from API
      const restaurant = await getRestaurantById(id);
      if (restaurant) {
        // Cache the restaurant
        await cacheRestaurant(restaurant);
        return restaurant;
      }

      return null;
    } catch (err) {
      console.error('Error getting restaurant details:', err);
      // Try to get from cache if API fails
      try {
        return await getRestaurantById(id);
      } catch (cacheErr) {
        console.error('Error getting cached restaurant details:', cacheErr);
        return null;
      }
    }
  }, []);

  // Get inspection history
  const getInspectionHistoryForRestaurant = useCallback(async (restaurantId: string): Promise<Inspection[]> => {
    try {
      // First try to get from cache
      const cachedInspections = await getCachedInspections(restaurantId);
      if (cachedInspections.length > 0) {
        return cachedInspections;
      }

      // If not in cache, fetch from API
      const inspections = await getInspectionHistory(restaurantId);
      if (inspections.length > 0) {
        // Cache the inspections
        await cacheInspections(inspections);
        return inspections;
      }

      return [];
    } catch (err) {
      console.error('Error getting inspection history:', err);
      // Try to get from cache if API fails
      try {
        return await getCachedInspections(restaurantId);
      } catch (cacheErr) {
        console.error('Error getting cached inspection history:', cacheErr);
        return [];
      }
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  return {
    restaurants,
    isLoading,
    error,
    refresh,
    search,
    getRestaurantDetails,
    getInspectionHistory: getInspectionHistoryForRestaurant,
  };
};
