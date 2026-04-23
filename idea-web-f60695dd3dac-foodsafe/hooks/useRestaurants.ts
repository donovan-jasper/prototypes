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
  const [currentCity, setCurrentCity] = useState<string>('san_francisco');
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
    if (!location) {
      setError('Location not available. Please enable location services.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from API
      try {
        const results = await api.searchRestaurants(
          query,
          location.coords.latitude,
          location.coords.longitude
        );
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
  }, [location]);

  const getRestaurantDetails = useCallback(async (restaurantId: string) => {
    if (!location) {
      throw new Error('Location not available. Please enable location services.');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from API
      try {
        const restaurant = await api.getRestaurantDetails(
          restaurantId,
          location.coords.latitude,
          location.coords.longitude
        );
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
  }, [location]);

  const refreshData = useCallback(async () => {
    if (location) {
      await fetchRestaurantsByLocation();
    }
  }, [location, fetchRestaurantsByLocation]);

  // Apply premium filters if available
  const applyPremiumFilters = useCallback((restaurants: Restaurant[], filters: any) => {
    if (isPremium) {
      // Premium users get access to all filters
      return restaurants.filter(restaurant => {
        if (filters.minScore && restaurant.safetyScore < filters.minScore) return false;
        if (filters.maxScore && restaurant.safetyScore > filters.maxScore) return false;
        if (filters.cuisine && !restaurant.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())) return false;
        if (filters.hasRecentInspection) {
          const inspectionDate = new Date(restaurant.lastInspectionDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (inspectionDate < thirtyDaysAgo) return false;
        }
        if (filters.hasNoViolations && restaurant.violationCount > 0) return false;
        return true;
      });
    } else {
      // Free users get limited data
      return restaurants
        .filter(restaurant => {
          if (filters.minScore && restaurant.safetyScore < filters.minScore) return false;
          if (filters.maxScore && restaurant.safetyScore > filters.maxScore) return false;
          return true;
        })
        .map(restaurant => ({
          ...restaurant,
          // Hide violation details for free users
          violationCount: 0,
          // Show only basic inspection info
          lastInspectionDate: restaurant.lastInspectionDate ? 'Recent inspection' : 'No inspection data available',
        }));
    }
  }, [isPremium]);

  // Detect city based on location
  useEffect(() => {
    if (location) {
      const detectCity = async () => {
        try {
          // In a real app, you would use a reverse geocoding API here
          // For demo purposes, we'll use simple coordinate ranges
          const { latitude, longitude } = location.coords;

          if (latitude >= 40.5 && latitude <= 40.9 && longitude >= -74.3 && longitude <= -73.7) {
            setCurrentCity('nyc');
          } else if (latitude >= 41.6 && latitude <= 42.1 && longitude >= -88.0 && longitude <= -87.5) {
            setCurrentCity('chicago');
          } else if (latitude >= 37.6 && latitude <= 37.9 && longitude >= -122.6 && longitude <= -122.3) {
            setCurrentCity('san_francisco');
          } else {
            setCurrentCity('san_francisco'); // Default to San Francisco
          }
        } catch (error) {
          console.error('Error detecting city:', error);
          setCurrentCity('san_francisco'); // Fallback
        }
      };

      detectCity();
    }
  }, [location]);

  return {
    restaurants,
    isLoading,
    error,
    location,
    isOffline,
    currentCity,
    fetchRestaurantsByLocation,
    searchRestaurants,
    getRestaurantDetails,
    refreshData,
    applyPremiumFilters,
  };
};
