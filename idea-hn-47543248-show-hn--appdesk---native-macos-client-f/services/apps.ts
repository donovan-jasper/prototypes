import { AppData } from '../types';

const mockApps: AppData[] = [
  {
    id: 'com.example.app1',
    name: 'Photo Editor Pro',
    iconUrl: 'https://example.com/icons/photo-editor.png',
    rating: 4.5,
    reviewCount: 1245,
    downloads: 500000,
    revenue: 1250.75,
    sales: 1500,
  },
  {
    id: 'com.example.app2',
    name: 'Workout Tracker',
    iconUrl: 'https://example.com/icons/workout-tracker.png',
    rating: 4.2,
    reviewCount: 872,
    downloads: 250000,
    revenue: 895.50,
    sales: 950,
  },
  {
    id: 'com.example.app3',
    name: 'Recipe Finder',
    iconUrl: 'https://example.com/icons/recipe-finder.png',
    rating: 4.7,
    reviewCount: 2300,
    downloads: 750000,
    revenue: 2100.00,
    sales: 2500,
  },
];

export const fetchUserApps = async (): Promise<AppData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, this would fetch from your backend
  // For now, we'll return the mock data
  return mockApps;

  // In a production app, you might want to:
  // 1. Check for cached data first
  // 2. Make the API call
  // 3. Update cache if successful
  // 4. Handle errors appropriately
};
