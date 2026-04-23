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
    // Fallback to mock data if API fails
    return mockRestaurants.filter(
      restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
    );
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
    // Fallback to mock data if API fails
    return mockRestaurants.filter(restaurant => {
      const distance = Math.sqrt(
        Math.pow(restaurant.latitude - latitude, 2) +
        Math.pow(restaurant.longitude - longitude, 2)
      );
      return distance <= radius;
    });
  }
};

export const getRestaurantDetails = async (restaurantId: string): Promise<Restaurant> => {
  try {
    // First try to get from cache
    if (restaurantCache.has(restaurantId)) {
      return restaurantCache.get(restaurantId)!;
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}`, {
      params: {
        business_id: restaurantId,
        $limit: 1,
      },
    });

    if (response.data.length === 0) {
      throw new Error('Restaurant not found');
    }

    const restaurant = transformRestaurantData(response.data[0]);

    // Cache the result
    restaurantCache.set(restaurant.id, restaurant);

    return restaurant;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    // Fallback to mock data if API fails
    const mockRestaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (mockRestaurant) {
      return mockRestaurant;
    }
    throw error;
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
        $limit: 10,
        $order: 'inspection_date DESC',
      },
    });

    const inspections = response.data.map(transformInspectionData);

    // Cache the results
    inspectionCache.set(restaurantId, inspections);

    return inspections;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    // Fallback to mock data if API fails
    return mockInspections.filter(i => i.restaurantId === restaurantId);
  }
};

// Mock data for when API fails
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Golden Bear',
    address: '123 University Ave, San Francisco, CA 94132',
    latitude: 37.7249,
    longitude: -122.4696,
    safetyScore: 88,
    lastInspectionDate: '2023-05-15',
    violationCount: 1,
    cuisine: 'American',
  },
  {
    id: '2',
    name: 'Tacos El Gordo',
    address: '456 Mission St, San Francisco, CA 94105',
    latitude: 37.7908,
    longitude: -122.4012,
    safetyScore: 92,
    lastInspectionDate: '2023-06-20',
    violationCount: 0,
    cuisine: 'Mexican',
  },
  {
    id: '3',
    name: 'The Cheese Steak Shop',
    address: '789 South Park Ave, San Francisco, CA 94108',
    latitude: 37.7749,
    longitude: -122.4194,
    safetyScore: 76,
    lastInspectionDate: '2023-04-10',
    violationCount: 3,
    cuisine: 'American',
  },
];

const mockInspections: Inspection[] = [
  {
    id: '1',
    restaurantId: '1',
    date: '2023-05-15',
    score: 88,
    violations: [
      {
        id: 'v1',
        description: 'Improper food storage',
        severity: 'medium',
      },
    ],
  },
  {
    id: '2',
    restaurantId: '2',
    date: '2023-06-20',
    score: 92,
    violations: [],
  },
  {
    id: '3',
    restaurantId: '3',
    date: '2023-04-10',
    score: 76,
    violations: [
      {
        id: 'v2',
        description: 'Inadequate handwashing facilities',
        severity: 'medium',
      },
      {
        id: 'v3',
        description: 'Expired food items',
        severity: 'high',
      },
      {
        id: 'v4',
        description: 'Insects in food prep area',
        severity: 'high',
      },
    ],
  },
];
