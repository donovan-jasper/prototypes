import { apiService } from '@/services/api';
import { Restaurant, Inspection } from '@/types';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('ApiService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    apiService.clearCache();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('fetchRestaurants', () => {
    it('should fetch restaurants from NYC API', async () => {
      const mockData = [{
        camis: '12345',
        dba: 'Test Restaurant',
        building: '123',
        street: 'Main St',
        boro: 'Manhattan',
        zipcode: '10001',
        latitude: '40.7128',
        longitude: '-74.0060',
        inspection_date: '2023-01-15',
        violation_code: '10A,10B',
        cuisine_description: 'Italian'
      }];

      mockAxios.onGet('https://data.cityofnewyork.us/resource/43nn-pn8j.json').reply(200, mockData);

      const restaurants = await apiService.fetchRestaurants(40.7128, -74.0060);

      expect(restaurants).toHaveLength(1);
      expect(restaurants[0].name).toBe('Test Restaurant');
      expect(restaurants[0].safetyScore).toBeGreaterThan(0);
    });

    it('should handle API errors', async () => {
      mockAxios.onGet('https://data.cityofnewyork.us/resource/43nn-pn8j.json').reply(500);

      await expect(apiService.fetchRestaurants(40.7128, -74.0060)).rejects.toThrow();
    });
  });

  describe('fetchInspections', () => {
    it('should fetch inspections for a restaurant', async () => {
      const mockData = [{
        inspection_id: 'insp1',
        camis: '12345',
        inspection_date: '2023-01-15',
        score: '90',
        violation_code: '10A',
        violation_description: 'Cleanliness issue',
        critical_flag: 'Not Critical'
      }];

      mockAxios.onGet('https://data.cityofnewyork.us/resource/43nn-pn8j.json').reply(200, mockData);

      const inspections = await apiService.fetchInspections('12345', 'nyc');

      expect(inspections).toHaveLength(1);
      expect(inspections[0].violations).toHaveLength(1);
    });
  });

  describe('searchRestaurants', () => {
    it('should search restaurants by name', async () => {
      const mockData = [{
        camis: '12345',
        dba: 'Pizza Place',
        building: '123',
        street: 'Main St',
        boro: 'Manhattan',
        zipcode: '10001',
        latitude: '40.7128',
        longitude: '-74.0060',
        inspection_date: '2023-01-15',
        violation_code: '10A,10B',
        cuisine_description: 'Italian'
      }];

      mockAxios.onGet('https://data.cityofnewyork.us/resource/43nn-pn8j.json').reply(200, mockData);

      const restaurants = await apiService.searchRestaurants('Pizza', 'nyc');

      expect(restaurants).toHaveLength(1);
      expect(restaurants[0].name).toBe('Pizza Place');
    });
  });

  describe('calculateSafetyScoreForRestaurant', () => {
    it('should calculate a score based on violations', () => {
      const score = apiService.calculateSafetyScoreForRestaurant('12345', 'nyc');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('cache', () => {
    it('should cache restaurant data', async () => {
      const mockData = [{
        camis: '12345',
        dba: 'Test Restaurant',
        building: '123',
        street: 'Main St',
        boro: 'Manhattan',
        zipcode: '10001',
        latitude: '40.7128',
        longitude: '-74.0060',
        inspection_date: '2023-01-15',
        violation_code: '10A,10B',
        cuisine_description: 'Italian'
      }];

      mockAxios.onGet('https://data.cityofnewyork.us/resource/43nn-pn8j.json').reply(200, mockData);

      // First call should make API request
      await apiService.fetchRestaurants(40.7128, -74.0060);

      // Second call should use cache
      const restaurants = await apiService.fetchRestaurants(40.7128, -74.0060);

      expect(restaurants).toHaveLength(1);
      expect(mockAxios.history.get.length).toBe(1); // Only one API call
    });
  });
});
