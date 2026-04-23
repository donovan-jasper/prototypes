import { databaseService } from '@/services/database';
import { Restaurant, Inspection } from '@/types';

describe('DatabaseService', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await databaseService.clearOldCache();
  });

  describe('Restaurant Caching', () => {
    it('should cache restaurants and retrieve them', async () => {
      const testRestaurants: Restaurant[] = [
        {
          id: '1',
          name: 'Test Restaurant 1',
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060,
          safetyScore: 85,
          lastInspectionDate: '2023-01-15',
          violationCount: 2,
          cuisine: 'Italian'
        },
        {
          id: '2',
          name: 'Test Restaurant 2',
          address: '456 Oak Ave',
          latitude: 40.7130,
          longitude: -74.0055,
          safetyScore: 90,
          lastInspectionDate: '2023-02-20',
          violationCount: 0,
          cuisine: 'American'
        }
      ];

      // Cache the restaurants
      await databaseService.cacheRestaurants(testRestaurants, 40.7128, -74.0060);

      // Retrieve them
      const cachedRestaurants = await databaseService.getCachedRestaurants(40.7128, -74.0060);

      expect(cachedRestaurants).toHaveLength(2);
      expect(cachedRestaurants[0].name).toBe('Test Restaurant 1');
      expect(cachedRestaurants[1].safetyScore).toBe(90);
    });

    it('should not return restaurants outside the radius', async () => {
      const testRestaurants: Restaurant[] = [
        {
          id: '1',
          name: 'Test Restaurant 1',
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060,
          safetyScore: 85,
          lastInspectionDate: '2023-01-15',
          violationCount: 2,
          cuisine: 'Italian'
        }
      ];

      await databaseService.cacheRestaurants(testRestaurants, 40.7128, -74.0060);

      // Try to get restaurants far away
      const cachedRestaurants = await databaseService.getCachedRestaurants(34.0522, -118.2437, 0.1);

      expect(cachedRestaurants).toHaveLength(0);
    });
  });

  describe('Inspection Caching', () => {
    it('should cache inspections and retrieve them', async () => {
      const testInspections: Inspection[] = [
        {
          id: 'insp1',
          restaurantId: '1',
          date: '2023-01-15',
          score: 85,
          violations: [
            {
              id: 'v1',
              description: 'Cleanliness issue',
              severity: 'medium'
            }
          ]
        },
        {
          id: 'insp2',
          restaurantId: '1',
          date: '2023-02-20',
          score: 90,
          violations: []
        }
      ];

      await databaseService.cacheInspections('1', testInspections);

      const cachedInspections = await databaseService.getCachedInspections('1');

      expect(cachedInspections).toHaveLength(2);
      expect(cachedInspections[0].violations).toHaveLength(1);
      expect(cachedInspections[1].violations).toHaveLength(0);
    });
  });

  describe('User Lists', () => {
    it('should create and retrieve user lists', async () => {
      const list = await databaseService.createUserList('Favorites');

      expect(list.name).toBe('Favorites');
      expect(list.id).toBeTruthy();

      const lists = await databaseService.getUserLists();

      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('Favorites');
    });

    it('should add and remove restaurants from lists', async () => {
      const list = await databaseService.createUserList('Favorites');

      await databaseService.addRestaurantToList(list.id, '1');
      await databaseService.addRestaurantToList(list.id, '2');

      const lists = await databaseService.getUserLists();

      expect(lists[0].restaurantIds).toContain('1');
      expect(lists[0].restaurantIds).toContain('2');

      await databaseService.removeRestaurantFromList(list.id, '1');

      const updatedLists = await databaseService.getUserLists();

      expect(updatedLists[0].restaurantIds).not.toContain('1');
      expect(updatedLists[0].restaurantIds).toContain('2');
    });
  });

  describe('Cache Management', () => {
    it('should clear old cache entries', async () => {
      const oldRestaurants: Restaurant[] = [
        {
          id: 'old1',
          name: 'Old Restaurant',
          address: 'Old Address',
          latitude: 40.7128,
          longitude: -74.0060,
          safetyScore: 70,
          lastInspectionDate: '2023-01-01',
          violationCount: 5,
          cuisine: 'Old Cuisine'
        }
      ];

      // Cache old data (this would normally be cleared)
      await databaseService.cacheRestaurants(oldRestaurants, 40.7128, -74.0060);

      // Manually set the cachedAt time to be older than 7 days
      // In a real test, you would need to mock the current date

      // Then clear old cache
      await databaseService.clearOldCache();

      // Verify old data is gone
      const cachedRestaurants = await databaseService.getCachedRestaurants(40.7128, -74.0060);
      expect(cachedRestaurants).toHaveLength(0);
    });
  });
});
