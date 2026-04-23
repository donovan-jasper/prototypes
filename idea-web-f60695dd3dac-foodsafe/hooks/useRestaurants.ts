import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Restaurant } from '@/types';
import { useLocation } from './useLocation';
import { databaseService } from '@/services/database';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location, isLoading: isLocationLoading } = useLocation();

  // Fetch restaurants based on current location
  const fetchRestaurants = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // First try to get cached data
      const cachedRestaurants = await databaseService.getCachedRestaurants(location.latitude, location.longitude);
      if (cachedRestaurants.length > 0) {
        setRestaurants(cachedRestaurants);
      }

      // Then fetch fresh data from API
      const freshRestaurants = await apiService.fetchRestaurants(
        location.latitude,
        location.longitude
      );

      // Update state and cache
      setRestaurants(freshRestaurants);
      await databaseService.cacheRestaurants(freshRestaurants, location.latitude, location.longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      // If API fails but we have cached data, keep showing that
      if (restaurants.length === 0) {
        const cachedRestaurants = await databaseService.getCachedRestaurants(location.latitude, location.longitude);
        if (cachedRestaurants.length > 0) {
          setRestaurants(cachedRestaurants);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [location, restaurants.length]);

  // Refresh data when location changes
  useEffect(() => {
    if (location) {
      fetchRestaurants();
    }
  }, [location, fetchRestaurants]);

  // Search restaurants by query
  const searchRestaurants = useCallback(async (query: string) => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const city = await detectCityFromCoordinates(location.latitude, location.longitude);
      const results = await apiService.searchRestaurants(query, city);
      setRestaurants(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search restaurants');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Filter restaurants by safety score
  const filterBySafetyScore = useCallback((minScore: number) => {
    setRestaurants(prev => prev.filter(r => r.safetyScore >= minScore));
  }, []);

  // Get restaurant details by ID
  const getRestaurantDetails = useCallback(async (id: string) => {
    if (!location) return null;

    setIsLoading(true);
    setError(null);

    try {
      const city = await detectCityFromCoordinates(location.latitude, location.longitude);
      const inspections = await apiService.fetchInspections(id, city);
      const restaurant = restaurants.find(r => r.id === id);

      if (restaurant) {
        return {
          ...restaurant,
          inspections
        };
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [location, restaurants]);

  return {
    restaurants,
    isLoading: isLoading || isLocationLoading,
    error,
    fetchRestaurants,
    searchRestaurants,
    filterBySafetyScore,
    getRestaurantDetails
  };
};

// Helper function to detect city from coordinates (same as in api.ts)
const detectCityFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    if (latitude >= 40.5 && latitude <= 40.9 && longitude >= -74.3 && longitude <= -73.7) {
      return 'nyc';
    } else if (latitude >= 41.6 && latitude <= 42.1 && longitude >= -88.0 && longitude <= -87.5) {
      return 'chicago';
    } else if (latitude >= 37.6 && latitude <= 37.9 && longitude >= -122.6 && longitude <= -122.3) {
      return 'san_francisco';
    }
    return 'san_francisco'; // Default to San Francisco
  } catch (error) {
    console.error('Error detecting city:', error);
    return 'san_francisco'; // Fallback
  }
};
