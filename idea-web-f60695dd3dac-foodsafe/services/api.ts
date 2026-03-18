import axios from 'axios';
import { Restaurant, Inspection } from '@/types';

const MOCK_DELAY = 800;

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

export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  
  const lowerQuery = query.toLowerCase().trim();
  
  return mockRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(lowerQuery) ||
      restaurant.cuisine.toLowerCase().includes(lowerQuery) ||
      restaurant.address.toLowerCase().includes(lowerQuery)
  );
};

export const getRestaurantsByLocation = async (
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<Restaurant[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return mockRestaurants;
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return mockRestaurants.find((r) => r.id === id) || null;
};

export const getInspectionHistory = async (restaurantId: string): Promise<Inspection[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  return mockInspections[restaurantId] || [];
};
