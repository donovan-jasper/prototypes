import axios from 'axios';
import { Restaurant, Inspection } from '@/types';

// Configuration for multiple health department APIs
const API_CONFIGS = {
  'nyc': {
    baseUrl: 'https://data.cityofnewyork.us/resource/43nn-pn8j.json',
    params: {
      $limit: 50,
      $order: 'inspection_date DESC'
    },
    transform: (data: any): Restaurant => ({
      id: data.dba || data.camis || Math.random().toString(36).substring(2, 9),
      name: data.dba || 'Unknown Restaurant',
      address: `${data.building} ${data.street}, ${data.boro}, ${data.zipcode}`,
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      safetyScore: 0, // Will be calculated
      lastInspectionDate: data.inspection_date || 'Unknown',
      violationCount: data.violation_code ? data.violation_code.split(',').length : 0,
      cuisine: data.cuisine_description || 'Unknown',
    })
  },
  'chicago': {
    baseUrl: 'https://data.cityofchicago.org/resource/4ijn-s7e5.json',
    params: {
      $limit: 50,
      $order: 'inspection_date DESC'
    },
    transform: (data: any): Restaurant => ({
      id: data.license_id || Math.random().toString(36).substring(2, 9),
      name: data.dba_name || 'Unknown Restaurant',
      address: `${data.address} ${data.city}, ${data.state} ${data.zip}`,
      latitude: parseFloat(data.latitude) || 0,
      longitude: parseFloat(data.longitude) || 0,
      safetyScore: 0, // Will be calculated
      lastInspectionDate: data.inspection_date || 'Unknown',
      violationCount: data.violations ? data.violations.split('|').length : 0,
      cuisine: data.facility_type || 'Unknown',
    })
  },
  'san_francisco': {
    baseUrl: 'https://data.sfgov.org/resource/rqzj-sfat.json',
    params: {
      $limit: 50,
      $order: 'inspection_date DESC'
    },
    transform: (data: any): Restaurant => ({
      id: data.business_id || data.id || Math.random().toString(36).substring(2, 9),
      name: data.business_name || 'Unknown Restaurant',
      address: data.location ? `${data.location.address} ${data.location.city}, ${data.location.state} ${data.location.zip}` : 'Address not available',
      latitude: data.location?.latitude ? parseFloat(data.location.latitude) : 0,
      longitude: data.location?.longitude ? parseFloat(data.location.longitude) : 0,
      safetyScore: 0, // Will be calculated
      lastInspectionDate: data.inspection_date || 'Unknown',
      violationCount: data.violations ? data.violations.length : 0,
      cuisine: data.facility_type || 'Unknown',
    })
  }
};

// Cache for restaurant data to reduce API calls
const restaurantCache = new Map<string, Restaurant>();
const inspectionCache = new Map<string, Inspection[]>();

// Helper function to detect city from coordinates
const detectCityFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // In a real app, you would use a reverse geocoding API here
    // For demo purposes, we'll use simple coordinate ranges
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

// Helper function to transform API response to our Inspection type
const transformInspectionData = (apiData: any, city: string): Inspection => {
  switch (city) {
    case 'nyc':
      return {
        id: apiData.inspection_id || Math.random().toString(36).substring(2, 9),
        restaurantId: apiData.camis || 'unknown',
        date: apiData.inspection_date || 'Unknown',
        score: apiData.score || 0,
        violations: apiData.violation_code ? [{
          id: apiData.violation_code,
          description: apiData.violation_description || 'Unknown violation',
          severity: apiData.critical_flag === 'Critical' ? 'critical' : 'medium',
        }] : [],
      };
    case 'chicago':
      return {
        id: apiData.inspection_id || Math.random().toString(36).substring(2, 9),
        restaurantId: apiData.license_id || 'unknown',
        date: apiData.inspection_date || 'Unknown',
        score: apiData.results ? parseInt(apiData.results) : 0,
        violations: apiData.violations ? apiData.violations.split('|').map((v: string, i: number) => ({
          id: `${apiData.inspection_id}-${i}`,
          description: v,
          severity: v.includes('Critical') ? 'critical' : 'medium',
        })) : [],
      };
    case 'san_francisco':
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
    default:
      return {
        id: apiData.id || Math.random().toString(36).substring(2, 9),
        restaurantId: apiData.business_id || 'unknown',
        date: apiData.inspection_date || 'Unknown',
        score: apiData.score || 0,
        violations: [],
      };
  }
};

export const searchRestaurants = async (query: string, latitude: number, longitude: number): Promise<Restaurant[]> => {
  try {
    const city = await detectCityFromCoordinates(latitude, longitude);
    const config = API_CONFIGS[city as keyof typeof API_CONFIGS];

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
    const response = await axios.get(config.baseUrl, {
      params: {
        ...config.params,
        $where: `lower(dba) like lower('%${query}%') or lower(cuisine_description) like lower('%${query}%')`
      },
    });

    const restaurants = response.data.map(config.transform);

    // Fetch inspections for each restaurant to calculate safety score
    const restaurantsWithScores = await Promise.all(
      restaurants.map(async (restaurant) => {
        const inspections = await getInspectionsForRestaurant(restaurant.id, city);
        return {
          ...restaurant,
          safetyScore: calculateSafetyScore(inspections),
          lastInspectionDate: inspections.length > 0 ? inspections[0].date : 'No inspections',
          violationCount: inspections.length > 0 ? inspections[0].violations.length : 0,
        };
      })
    );

    // Cache the results
    restaurantsWithScores.forEach(restaurant => {
      restaurantCache.set(restaurant.id, restaurant);
    });

    return restaurantsWithScores;
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
    const city = await detectCityFromCoordinates(latitude, longitude);
    const config = API_CONFIGS[city as keyof typeof API_CONFIGS];

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
    const response = await axios.get(config.baseUrl, {
      params: {
        ...config.params,
        $where: `within_circle(location, ${latitude}, ${longitude}, ${radius * 1000})`
      },
    });

    const restaurants = response.data.map(config.transform);

    // Fetch inspections for each restaurant to calculate safety score
    const restaurantsWithScores = await Promise.all(
      restaurants.map(async (restaurant) => {
        const inspections = await getInspectionsForRestaurant(restaurant.id, city);
        return {
          ...restaurant,
          safetyScore: calculateSafetyScore(inspections),
          lastInspectionDate: inspections.length > 0 ? inspections[0].date : 'No inspections',
          violationCount: inspections.length > 0 ? inspections[0].violations.length : 0,
        };
      })
    );

    // Cache the results
    restaurantsWithScores.forEach(restaurant => {
      restaurantCache.set(restaurant.id, restaurant);
    });

    return restaurantsWithScores;
  } catch (error) {
    console.error('Error fetching restaurants by location:', error);
    throw new Error('Failed to fetch restaurants. Please check your connection.');
  }
};

export const getRestaurantDetails = async (restaurantId: string, latitude: number, longitude: number): Promise<Restaurant> => {
  try {
    const city = await detectCityFromCoordinates(latitude, longitude);
    const config = API_CONFIGS[city as keyof typeof API_CONFIGS];

    // First try to get from cache
    const cachedRestaurant = restaurantCache.get(restaurantId);
    if (cachedRestaurant) {
      return cachedRestaurant;
    }

    // If not in cache, fetch from API
    const response = await axios.get(config.baseUrl, {
      params: {
        ...config.params,
        $where: city === 'nyc' ? `camis='${restaurantId}'` : city === 'chicago' ? `license_id='${restaurantId}'` : `business_id='${restaurantId}'`
      },
    });

    if (response.data.length === 0) {
      throw new Error('Restaurant not found');
    }

    const restaurant = config.transform(response.data[0]);
    const inspections = await getInspectionsForRestaurant(restaurant.id, city);

    const restaurantWithDetails = {
      ...restaurant,
      safetyScore: calculateSafetyScore(inspections),
      lastInspectionDate: inspections.length > 0 ? inspections[0].date : 'No inspections',
      violationCount: inspections.length > 0 ? inspections[0].violations.length : 0,
    };

    // Cache the result
    restaurantCache.set(restaurant.id, restaurantWithDetails);

    return restaurantWithDetails;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw new Error('Failed to fetch restaurant details. Please check your connection.');
  }
};

export const getInspectionsForRestaurant = async (restaurantId: string, city: string): Promise<Inspection[]> => {
  try {
    // First try to get from cache
    const cachedInspections = inspectionCache.get(restaurantId);
    if (cachedInspections) {
      return cachedInspections;
    }

    // If not in cache, fetch from API
    const config = API_CONFIGS[city as keyof typeof API_CONFIGS];
    const response = await axios.get(config.baseUrl, {
      params: {
        ...config.params,
        $where: city === 'nyc' ? `camis='${restaurantId}'` : city === 'chicago' ? `license_id='${restaurantId}'` : `business_id='${restaurantId}'`,
        $order: 'inspection_date DESC'
      },
    });

    const inspections = response.data.map((data: any) => transformInspectionData(data, city));

    // Cache the results
    inspectionCache.set(restaurantId, inspections);

    return inspections;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw new Error('Failed to fetch inspections. Please check your connection.');
  }
};

export const getCachedRestaurants = (): Restaurant[] => {
  return Array.from(restaurantCache.values());
};

export const clearCache = () => {
  restaurantCache.clear();
  inspectionCache.clear();
};
