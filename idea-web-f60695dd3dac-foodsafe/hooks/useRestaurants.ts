import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '@/types';
import * as api from '@/services/api';
import * as Location from 'expo-location';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const fetchRestaurantsByLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Fetch restaurants near current location
      const fetchedRestaurants = await api.getRestaurantsByLocation(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      setRestaurants(fetchedRestaurants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRestaurants = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await api.searchRestaurants(query);
      setRestaurants(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search restaurants');
      console.error('Error searching restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRestaurantDetails = useCallback(async (restaurantId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const restaurant = await api.getRestaurantDetails(restaurantId);
      return restaurant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurant details');
      console.error('Error fetching restaurant details:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (location) {
      await fetchRestaurantsByLocation();
    }
  }, [location, fetchRestaurantsByLocation]);

  return {
    restaurants,
    isLoading,
    error,
    location,
    fetchRestaurantsByLocation,
    searchRestaurants,
    getRestaurantDetails,
    refreshData,
  };
};
