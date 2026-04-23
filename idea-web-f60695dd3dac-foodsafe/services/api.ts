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
      id: data.camis || Math.random().toString(36).substring(2, 9),
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
          severity: apiData.critical_flag === 'Critical' ? 'high' : 'medium',
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
          severity: v.toLowerCase().includes('critical') ? 'high' : 'medium',
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
        id: Math.random().toString(36).substring(2, 9),
        restaurantId: 'unknown',
        date: 'Unknown',
        score: 0,
        violations: [],
      };
  }
};

// Main API service class
class ApiService {
  // Fetch restaurants near a specific location
  async fetchRestaurants(latitude: number, longitude: number, radius: number = 1): Promise<Restaurant[]> {
    try {
      const city = await detectCityFromCoordinates(latitude, longitude);
      const config = API_CONFIGS[city];

      // Check cache first
      const cacheKey = `${city}-${latitude}-${longitude}`;
      if (restaurantCache.has(cacheKey)) {
        return Array.from(restaurantCache.values());
      }

      // Make API request
      const response = await axios.get(config.baseUrl, {
        params: {
          ...config.params,
          $where: `within_circle(location, ${latitude}, ${longitude}, ${radius})`
        }
      });

      // Transform and cache results
      const restaurants = response.data.map((item: any) => {
        const restaurant = config.transform(item);
        restaurant.safetyScore = this.calculateSafetyScoreForRestaurant(restaurant.id, city);
        return restaurant;
      });

      // Cache the results
      restaurants.forEach(restaurant => {
        restaurantCache.set(restaurant.id, restaurant);
      });

      return restaurants;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw new Error('Failed to fetch restaurant data. Please check your internet connection.');
    }
  }

  // Fetch inspection history for a specific restaurant
  async fetchInspections(restaurantId: string, city: string): Promise<Inspection[]> {
    try {
      // Check cache first
      if (inspectionCache.has(restaurantId)) {
        return inspectionCache.get(restaurantId) || [];
      }

      const config = API_CONFIGS[city];
      let response;

      switch (city) {
        case 'nyc':
          response = await axios.get(config.baseUrl, {
            params: {
              camis: restaurantId,
              $order: 'inspection_date DESC',
              $limit: 10
            }
          });
          break;
        case 'chicago':
          response = await axios.get(config.baseUrl, {
            params: {
              license_id: restaurantId,
              $order: 'inspection_date DESC',
              $limit: 10
            }
          });
          break;
        case 'san_francisco':
          response = await axios.get(config.baseUrl, {
            params: {
              business_id: restaurantId,
              $order: 'inspection_date DESC',
              $limit: 10
            }
          });
          break;
        default:
          throw new Error('Unsupported city');
      }

      // Transform and cache results
      const inspections = response.data.map((item: any) => transformInspectionData(item, city));

      // Cache the results
      inspectionCache.set(restaurantId, inspections);

      return inspections;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw new Error('Failed to fetch inspection data. Please check your internet connection.');
    }
  }

  // Calculate safety score for a restaurant based on its inspection history
  calculateSafetyScoreForRestaurant(restaurantId: string, city: string): number {
    try {
      // In a real app, we would fetch the actual inspections
      // For demo purposes, we'll use mock data
      const mockInspections: Inspection[] = [
        {
          id: '1',
          restaurantId,
          date: '2023-01-15',
          score: 90,
          violations: []
        },
        {
          id: '2',
          restaurantId,
          date: '2022-11-20',
          score: 85,
          violations: [{
            id: 'v1',
            description: 'Minimal food safety practices',
            severity: 'medium'
          }]
        }
      ];

      return calculateSafetyScore(mockInspections);
    } catch (error) {
      console.error('Error calculating safety score:', error);
      return 70; // Default score if calculation fails
    }
  }

  // Search for restaurants by name or cuisine
  async searchRestaurants(query: string, city: string): Promise<Restaurant[]> {
    try {
      const config = API_CONFIGS[city];

      // Check cache first
      const cacheKey = `${city}-search-${query}`;
      if (restaurantCache.has(cacheKey)) {
        return Array.from(restaurantCache.values());
      }

      let response;

      switch (city) {
        case 'nyc':
          response = await axios.get(config.baseUrl, {
            params: {
              $where: `dba LIKE '%${query}%' OR cuisine_description LIKE '%${query}%'`,
              $limit: 50
            }
          });
          break;
        case 'chicago':
          response = await axios.get(config.baseUrl, {
            params: {
              $where: `dba_name LIKE '%${query}%' OR facility_type LIKE '%${query}%'`,
              $limit: 50
            }
          });
          break;
        case 'san_francisco':
          response = await axios.get(config.baseUrl, {
            params: {
              $where: `business_name LIKE '%${query}%' OR facility_type LIKE '%${query}%'`,
              $limit: 50
            }
          });
          break;
        default:
          throw new Error('Unsupported city');
      }

      // Transform and cache results
      const restaurants = response.data.map((item: any) => {
        const restaurant = config.transform(item);
        restaurant.safetyScore = this.calculateSafetyScoreForRestaurant(restaurant.id, city);
        return restaurant;
      });

      // Cache the results
      restaurants.forEach(restaurant => {
        restaurantCache.set(restaurant.id, restaurant);
      });

      return restaurants;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw new Error('Failed to search for restaurants. Please check your internet connection.');
    }
  }

  // Clear cache (useful when user location changes significantly)
  clearCache() {
    restaurantCache.clear();
    inspectionCache.clear();
  }
}

// Export singleton instance
export const apiService = new ApiService();
