import axios from 'axios';
import { Restaurant, Inspection } from '@/types';

// Configuration for Open Data San Francisco API
const SAN_FRANCISCO_API_BASE = 'https://data.sfgov.org/resource/';
const SAN_FRANCISCO_DATASET = 'rqzj-sfat'; // Food Establishment Inspection Data

// Cache for restaurant data to reduce API calls
const restaurantCache = new Map<string, Restaurant>();
const inspectionCache = new Map<string, Inspection[]>();

// Helper function to calculate safety score from inspection data
const calculateSafetyScore = (inspections: Inspection[]): number => {
  if (inspections.length === 0) return 70; // Default score if no inspections

  const latestInspection = inspections[0];
  const violationCount = latestInspection.violations.length;

  // Simple scoring algorithm - adjust as needed
  if (violationCount === 0) return 95;
  if (violationCount <= 2) return 85;
  if (violationCount <= 5) return 75;
  return 65;
};

// Helper function to transform API response to our Restaurant type
const transformRestaurantData = (apiData: any): Restaurant => {
  const id = apiData.business_id || apiData.id || Math.random().toString(36).substring(2, 9);

  return {
    id,
    name: apiData.business_name || 'Unknown Restaurant',
    address: apiData.location ? `${apiData.location.address} ${apiData.location.city}, ${apiData.location.state} ${apiData.location.zip}` : 'Address not available',
    latitude: apiData.location?.latitude ? parseFloat(apiData.location.latitude) : 0,
    longitude: apiData.location?.longitude ? parseFloat(apiData.location.longitude) : 0,
    safetyScore: 0, // Will be calculated from inspections
    lastInspectionDate: apiData.inspection_date || 'Unknown',
    violationCount: apiData.violations ? apiData.violations.length : 0,
    cuisine: apiData.facility_type || 'Unknown',
  };
};

// Helper function to transform API response to our Inspection type
const transformInspectionData = (apiData: any): Inspection => {
  return {
    id: apiData.id || Math.random().toString(36).substring(2, 9),
    restaurantId: apiData.business_id || 'unknown',
    date: apiData.inspection_date || 'Unknown',
    score: apiData.score || 0,
    violations: apiData.violations ? apiData.violations.map((v: any) => ({
      id: v.violation_id || Math.random().toString(36).substring(2, 9),
      description: v.description || 'Unknown violation',
      severity: v.severity || 'medium',
    })) : [],
  };
};

export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
  try {
    // First try to get from cache
    const cachedResults = Array.from(restaurantCache.values()).filter(
      restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
    );

    if (cachedResults.length > 0) {
      return cachedResults;
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}`, {
      params: {
        $where: `lower(business_name) like lower('%${query}%') or lower(facility_type) like lower('%${query}%')`,
        $limit: 50,
        $order: 'inspection_date DESC',
      },
    });

    const restaurants = response.data.map(transformRestaurantData);

    // Cache the results
    restaurants.forEach(restaurant => {
      restaurantCache.set(restaurant.id, restaurant);
    });

    return restaurants;
  } catch (error) {
    console.error('Error searching restaurants:', error);
    throw new Error('Failed to search restaurants. Please check your connection.');
  }
};

export const getRestaurantsByLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<Restaurant[]> => {
  try {
    // First try to get from cache
    const cachedResults = Array.from(restaurantCache.values()).filter(
      restaurant => {
        // Simple distance calculation (not precise but good enough for demo)
        const distance = Math.sqrt(
          Math.pow(restaurant.latitude - latitude, 2) +
          Math.pow(restaurant.longitude - longitude, 2)
        );
        return distance <= radius;
      }
    );

    if (cachedResults.length > 0) {
      return cachedResults;
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}`, {
      params: {
        $where: `within_circle(location, ${latitude}, ${longitude}, ${radius * 1000})`,
        $limit: 50,
        $order: 'inspection_date DESC',
      },
    });

    const restaurants = response.data.map(transformRestaurantData);

    // Cache the results
    restaurants.forEach(restaurant => {
      restaurantCache.set(restaurant.id, restaurant);
    });

    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants by location:', error);
    throw new Error('Failed to fetch nearby restaurants. Please check your connection.');
  }
};

export const getRestaurantDetails = async (id: string): Promise<Restaurant> => {
  try {
    // First try to get from cache
    if (restaurantCache.has(id)) {
      return restaurantCache.get(id)!;
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}/${id}`);
    const restaurant = transformRestaurantData(response.data);

    // Cache the result
    restaurantCache.set(restaurant.id, restaurant);

    return restaurant;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw new Error('Failed to fetch restaurant details. Please check your connection.');
  }
};

export const getInspectionsForRestaurant = async (restaurantId: string): Promise<Inspection[]> => {
  try {
    // First try to get from cache
    if (inspectionCache.has(restaurantId)) {
      return inspectionCache.get(restaurantId)!;
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}`, {
      params: {
        business_id: restaurantId,
        $order: 'inspection_date DESC',
        $limit: 10,
      },
    });

    const inspections = response.data.map(transformInspectionData);

    // Cache the results
    inspectionCache.set(restaurantId, inspections);

    return inspections;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw new Error('Failed to fetch inspection history. Please check your connection.');
  }
};
