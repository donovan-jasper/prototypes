import axios from 'axios';
import { Establishment, Inspection } from '@/types';

// Mock API base URL
const API_BASE_URL = 'https://api.foodguard.example.com';

const mockEstablishments: Establishment[] = [
  {
    id: 'est-1',
    name: 'Green Leaf Café',
    address: '123 Main St, Anytown',
    latitude: 37.7749,
    longitude: -122.4194,
    safetyScore: 'A',
    lastInspectionDate: '2023-10-15',
    cuisineType: 'American',
    isOpen: true
  },
  {
    id: 'est-2',
    name: 'Sunny Sushi',
    address: '456 Ocean Ave, Seaside',
    latitude: 37.7849,
    longitude: -122.4294,
    safetyScore: 'B',
    lastInspectionDate: '2023-09-20',
    cuisineType: 'Japanese',
    isOpen: true
  },
  // Add more mock establishments...
];

const mockInspections: Record<string, Inspection[]> = {
  'est-1': [
    {
      id: 'insp-1',
      establishmentId: 'est-1',
      inspectionDate: '2023-10-15',
      violations: [
        { type: 'non-critical', description: 'Minor pest activity' },
        { type: 'non-critical', description: 'Food storage temperature not logged' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ],
  'est-2': [
    {
      id: 'insp-2',
      establishmentId: 'est-2',
      inspectionDate: '2023-09-20',
      violations: [
        { type: 'non-critical', description: 'Equipment not sanitized' },
        { type: 'non-critical', description: 'Handwashing facility not provided' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ]
};

const mockRecalls: Record<string, any[]> = {
  'est-1': [
    {
      id: 'recall-1',
      establishmentId: 'est-1',
      recallDate: '2023-11-01',
      description: 'Possible contamination in salad bar'
    }
  ]
};

// Mock API client
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Mock API endpoints
export const getNearbyEstablishments = async (latitude: number, longitude: number, radius: number = 2): Promise<Establishment[]> => {
  // In a real app, this would call the actual API
  // For now, return mock data filtered by distance
  return mockEstablishments.filter(est => {
    const distance = calculateDistance(latitude, longitude, est.latitude, est.longitude);
    return distance <= radius;
  });
};

export const getEstablishmentDetails = async (id: string): Promise<Establishment> => {
  // In a real app, this would call the actual API
  const establishment = mockEstablishments.find(est => est.id === id);
  if (!establishment) {
    throw new Error('Establishment not found');
  }
  return establishment;
};

export const getInspections = async (establishmentId: string): Promise<Inspection[]> => {
  // In a real app, this would call the actual API
  return mockInspections[establishmentId] || [];
};

export const getRecalls = async (establishmentId: string): Promise<any[]> => {
  // In a real app, this would call the actual API
  return mockRecalls[establishmentId] || [];
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// New endpoint for generating random recall alerts
export const generateRandomRecallAlerts = async (): Promise<void> => {
  // In a real app, this would call the actual API to generate recalls
  // For now, we'll simulate it by adding random recalls to our mock data

  // Select a random establishment
  const randomEstablishment = mockEstablishments[Math.floor(Math.random() * mockEstablishments.length)];

  // Generate a random recall
  const recallDescriptions = [
    'Possible contamination in food preparation area',
    'Equipment not properly sanitized',
    'Food storage temperature out of compliance',
    'Cross-contamination risk identified',
    'Pest activity observed in kitchen'
  ];

  const recall = {
    id: `recall-${Date.now()}`,
    establishmentId: randomEstablishment.id,
    recallDate: new Date().toISOString(),
    description: recallDescriptions[Math.floor(Math.random() * recallDescriptions.length)]
  };

  // Add to mock data
  if (!mockRecalls[randomEstablishment.id]) {
    mockRecalls[randomEstablishment.id] = [];
  }
  mockRecalls[randomEstablishment.id].push(recall);

  console.log(`Generated recall alert for ${randomEstablishment.name}: ${recall.description}`);
};

export default api;
