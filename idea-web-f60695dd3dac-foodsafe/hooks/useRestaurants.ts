import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '@/types';
import * as api from '@/services/api';
import * as Location from 'expo-location';
import { useSubscription } from './useSubscription';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const { isPremium } = useSubscription();

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

      // Try to fetch from API
      try {
        const fetchedRestaurants = await api.getRestaurantsByLocation(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        setRestaurants(fetchedRestaurants);
        setIsOffline(false);
      } catch (apiError) {
        // If API fails, fall back to cached data
        const cachedRestaurants = api.getCachedRestaurants();
        if (cachedRestaurants.length > 0) {
          setRestaurants(cachedRestaurants);
          setIsOffline(true);
          setError('Showing cached data. Please check your connection.');
        } else {
          throw new Error('No cached data available. Please check your connection.');
        }
      }
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

      // Try to fetch from API
      try {
        const results = await api.searchRestaurants(query);
        setRestaurants(results);
        setIsOffline(false);
      } catch (apiError) {
        // If API fails, fall back to cached data
        const cachedRestaurants = api.getCachedRestaurants().filter(
          restaurant =>
            restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
        );

        if (cachedRestaurants.length > 0) {
          setRestaurants(cachedRestaurants);
          setIsOffline(true);
          setError('Showing cached data. Please check your connection.');
        } else {
          throw new Error('No cached data available. Please check your connection.');
        }
      }
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

      // Try to fetch from API
      try {
        const restaurant = await api.getRestaurantDetails(restaurantId);
        setIsOffline(false);
        return restaurant;
      } catch (apiError) {
        // If API fails, fall back to cached data
        const cachedRestaurant = api.getCachedRestaurants().find(r => r.id === restaurantId);
        if (cachedRestaurant) {
          setIsOffline(true);
          setError('Showing cached data. Please check your connection.');
          return cachedRestaurant;
        } else {
          throw new Error('No cached data available. Please check your connection.');
        }
      }
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

  // Apply premium filters if available
  const applyPremiumFilters = useCallback((restaurants: Restaurant[]) => {
    if (isPremium) {
      // Premium users get access to all filters
      return restaurants;
    } else {
      // Free users get limited data
      return restaurants.map(restaurant => ({
        ...restaurant,
        // Hide violation details for free users
        violationCount: 0,
        // Show only basic inspection info
        lastInspectionDate: restaurant.lastInspectionDate ? 'Recent inspection' : 'No inspection data',
      }));
    }
  }, [isPremium]);

  // Apply filters to current restaurants
  const filteredRestaurants = useCallback((filters: {
    minScore?: number;
    maxScore?: number;
    cuisine?: string;
    hasRecentInspection?: boolean;
  }) => {
    let filtered = [...restaurants];

    if (filters.minScore !== undefined) {
      filtered = filtered.filter(r => r.safetyScore >= filters.minScore!);
    }

    if (filters.maxScore !== undefined) {
      filtered = filtered.filter(r => r.safetyScore <= filters.maxScore!);
    }

    if (filters.cuisine) {
      filtered = filtered.filter(r =>
        r.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase())
      );
    }

    if (filters.hasRecentInspection) {
      filtered = filtered.filter(r => {
        if (!r.lastInspectionDate || r.lastInspectionDate === 'No inspections') return false;

        const inspectionDate = new Date(r.lastInspectionDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - inspectionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 30; // Within last 30 days
      });
    }

    return applyPremiumFilters(filtered);
  }, [restaurants, applyPremiumFilters]);

  return {
    restaurants,
    isLoading,
    error,
    location,
    isOffline,
    fetchRestaurantsByLocation,
    searchRestaurants,
    getRestaurantDetails,
    refreshData,
    filteredRestaurants,
  };
};
