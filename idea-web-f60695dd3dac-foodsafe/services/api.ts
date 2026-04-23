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
    return mockRestaurants;
  }
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    // First try to get from cache
    if (restaurantCache.has(id)) {
      const restaurant = restaurantCache.get(id);
      if (restaurant) {
        // Get inspections to calculate safety score
        const inspections = await getInspectionHistory(id);
        if (inspections.length > 0) {
          restaurant.safetyScore = calculateSafetyScore(inspections);
          restaurant.lastInspectionDate = inspections[0].date;
          restaurant.violationCount = inspections[0].violations.length;
        }
        return restaurant;
      }
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}/${id}`);

    if (response.data) {
      const restaurant = transformRestaurantData(response.data);
      restaurantCache.set(restaurant.id, restaurant);

      // Get inspections to calculate safety score
      const inspections = await getInspectionHistory(id);
      if (inspections.length > 0) {
        restaurant.safetyScore = calculateSafetyScore(inspections);
        restaurant.lastInspectionDate = inspections[0].date;
        restaurant.violationCount = inspections[0].violations.length;
      }

      return restaurant;
    }

    return null;
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    // Fallback to mock data if API fails
    const mockRestaurant = mockRestaurants.find(r => r.id === id);
    if (mockRestaurant) {
      const inspections = await getInspectionHistory(id);
      if (inspections.length > 0) {
        mockRestaurant.safetyScore = calculateSafetyScore(inspections);
        mockRestaurant.lastInspectionDate = inspections[0].date;
        mockRestaurant.violationCount = inspections[0].violations.length;
      }
    }
    return mockRestaurant || null;
  }
};

export const getInspectionHistory = async (restaurantId: string): Promise<Inspection[]> => {
  try {
    // First try to get from cache
    if (inspectionCache.has(restaurantId)) {
      const inspections = inspectionCache.get(restaurantId);
      if (inspections) {
        return inspections;
      }
    }

    // If not in cache, fetch from API
    const response = await axios.get(`${SAN_FRANCISCO_API_BASE}${SAN_FRANCISCO_DATASET}`, {
      params: {
        business_id: restaurantId,
        $order: 'inspection_date DESC',
        $limit: 100,
      },
    });

    const inspections = response.data.map(transformInspectionData);

    // Cache the results
    inspectionCache.set(restaurantId, inspections);

    return inspections;
  } catch (error) {
    console.error('Error fetching inspection history:', error);
    // Fallback to mock data if API fails
    return mockInspections[restaurantId] || [];
  }
};

// Mock data as fallback
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The Green Leaf Bistro',
    address: '123 Main St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    safetyScore: 95,
    lastInspectionDate: '2024-02-15',
    violationCount: 1,
    cuisine: 'American',
  },
  {
    id: '2',
    name: 'Sushi Paradise',
    address: '456 Market St, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    safetyScore: 88,
    lastInspectionDate: '2024-01-20',
    violationCount: 3,
    cuisine: 'Japanese',
  },
  {
    id: '3',
    name: 'Pizza Heaven',
    address: '789 Valencia St, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.4294,
    safetyScore: 72,
    lastInspectionDate: '2024-02-01',
    violationCount: 5,
    cuisine: 'Italian',
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    address: '321 Mission St, San Francisco, CA',
    latitude: 37.7949,
    longitude: -122.3994,
    safetyScore: 91,
    lastInspectionDate: '2024-02-10',
    violationCount: 2,
    cuisine: 'Mexican',
  },
  {
    id: '5',
    name: 'Burger Palace',
    address: '654 Castro St, San Francisco, CA',
    latitude: 37.7549,
    longitude: -122.4394,
    safetyScore: 85,
    lastInspectionDate: '2024-01-25',
    violationCount: 4,
    cuisine: 'American',
  },
  {
    id: '6',
    name: 'Thai Spice',
    address: '987 Geary Blvd, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4294,
    safetyScore: 93,
    lastInspectionDate: '2024-02-12',
    violationCount: 1,
    cuisine: 'Thai',
  },
  {
    id: '7',
    name: 'French Corner Cafe',
    address: '147 Polk St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4094,
    safetyScore: 68,
    lastInspectionDate: '2024-01-18',
    violationCount: 7,
    cuisine: 'French',
  },
  {
    id: '8',
    name: 'Indian Curry House',
    address: '258 Divisadero St, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.4394,
    safetyScore: 89,
    lastInspectionDate: '2024-02-08',
    violationCount: 2,
    cuisine: 'Indian',
  },
];

const mockInspections: Record<string, Inspection[]> = {
  '1': [
    {
      id: 'i1-1',
      restaurantId: '1',
      date: '2024-02-15',
      score: 95,
      violations: [
        { id: 'v1', description: 'Minor temperature issue in walk-in cooler', severity: 'low' },
      ],
    },
    {
      id: 'i1-2',
      restaurantId: '1',
      date: '2023-11-10',
      score: 97,
      violations: [],
    },
    {
      id: 'i1-3',
      restaurantId: '1',
      date: '2023-08-05',
      score: 94,
      violations: [
        { id: 'v2', description: 'Food handler certificate expired', severity: 'low' },
      ],
    },
  ],
  '2': [
    {
      id: 'i2-1',
      restaurantId: '2',
      date: '2024-01-20',
      score: 88,
      violations: [
        { id: 'v3', description: 'Improper food storage temperature', severity: 'medium' },
        { id: 'v4', description: 'Missing handwashing signage', severity: 'low' },
        { id: 'v5', description: 'Inadequate pest control', severity: 'medium' },
      ],
    },
    {
      id: 'i2-2',
      restaurantId: '2',
      date: '2023-10-15',
      score: 92,
      violations: [
        { id: 'v6', description: 'Minor cleaning issue', severity: 'low' },
      ],
    },
    {
      id: 'i2-3',
      restaurantId: '2',
      date: '2023-07-20',
      score: 90,
      violations: [
        { id: 'v7', description: 'Equipment maintenance needed', severity: 'low' },
      ],
    },
  ],
};
