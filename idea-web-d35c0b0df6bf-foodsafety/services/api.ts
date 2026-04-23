import axios from 'axios';
import { Establishment, Inspection, Recall } from '@/types';

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
  {
    id: 'est-3',
    name: 'Burger Palace',
    address: '789 Fast Food Blvd, Metropolis',
    latitude: 37.7949,
    longitude: -122.4394,
    safetyScore: 'C',
    lastInspectionDate: '2023-08-10',
    cuisineType: 'Fast Food',
    isOpen: true
  },
  {
    id: 'est-4',
    name: 'Healthy Greens',
    address: '321 Organic Lane, Eco City',
    latitude: 37.7649,
    longitude: -122.4094,
    safetyScore: 'A',
    lastInspectionDate: '2023-10-05',
    cuisineType: 'Vegetarian',
    isOpen: true
  },
  {
    id: 'est-5',
    name: 'Taco Fiesta',
    address: '555 Spice St, Flavor Town',
    latitude: 37.7549,
    longitude: -122.4494,
    safetyScore: 'B',
    lastInspectionDate: '2023-09-15',
    cuisineType: 'Mexican',
    isOpen: true
  },
  {
    id: 'est-6',
    name: 'Pizza Paradise',
    address: '789 Cheese Ave, Dairyville',
    latitude: 37.7449,
    longitude: -122.4594,
    safetyScore: 'A',
    lastInspectionDate: '2023-10-20',
    cuisineType: 'Italian',
    isOpen: true
  },
  {
    id: 'est-7',
    name: 'Seafood Shack',
    address: '123 Ocean Blvd, Coastal City',
    latitude: 37.7349,
    longitude: -122.4694,
    safetyScore: 'B',
    lastInspectionDate: '2023-09-25',
    cuisineType: 'Seafood',
    isOpen: true
  },
  {
    id: 'est-8',
    name: 'Deli Delight',
    address: '456 Sandwich St, Breadtown',
    latitude: 37.7249,
    longitude: -122.4794,
    safetyScore: 'C',
    lastInspectionDate: '2023-08-20',
    cuisineType: 'Delicatessen',
    isOpen: true
  },
  {
    id: 'est-9',
    name: 'Bakery Bliss',
    address: '789 Pastry Lane, Sweetville',
    latitude: 37.7149,
    longitude: -122.4894,
    safetyScore: 'A',
    lastInspectionDate: '2023-10-10',
    cuisineType: 'Bakery',
    isOpen: true
  },
  {
    id: 'est-10',
    name: 'Coffee Corner',
    address: '321 Brew Ave, Java Junction',
    latitude: 37.7049,
    longitude: -122.4994,
    safetyScore: 'B',
    lastInspectionDate: '2023-09-30',
    cuisineType: 'Café',
    isOpen: true
  }
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
  ],
  'est-3': [
    {
      id: 'insp-3',
      establishmentId: 'est-3',
      inspectionDate: '2023-08-10',
      violations: [
        { type: 'non-critical', description: 'Food packaging not sealed properly' },
        { type: 'non-critical', description: 'Inadequate handwashing facilities' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ],
  'est-4': [
    {
      id: 'insp-4',
      establishmentId: 'est-4',
      inspectionDate: '2023-10-05',
      violations: [
        { type: 'non-critical', description: 'Minor pest activity' },
        { type: 'non-critical', description: 'Food storage temperature not logged' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ],
  'est-5': [
    {
      id: 'insp-5',
      establishmentId: 'est-5',
      inspectionDate: '2023-09-15',
      violations: [
        { type: 'non-critical', description: 'Equipment not sanitized' },
        { type: 'non-critical', description: 'Handwashing facility not provided' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ],
  'est-6': [
    {
      id: 'insp-6',
      establishmentId: 'est-6',
      inspectionDate: '2023-10-20',
      violations: [],
      criticalViolations: 0,
      nonCriticalViolations: 0
    }
  ],
  'est-7': [
    {
      id: 'insp-7',
      establishmentId: 'est-7',
      inspectionDate: '2023-09-25',
      violations: [
        { type: 'non-critical', description: 'Minor pest activity' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 1
    }
  ],
  'est-8': [
    {
      id: 'insp-8',
      establishmentId: 'est-8',
      inspectionDate: '2023-08-20',
      violations: [
        { type: 'non-critical', description: 'Food packaging not sealed properly' },
        { type: 'non-critical', description: 'Inadequate handwashing facilities' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 2
    }
  ],
  'est-9': [
    {
      id: 'insp-9',
      establishmentId: 'est-9',
      inspectionDate: '2023-10-10',
      violations: [],
      criticalViolations: 0,
      nonCriticalViolations: 0
    }
  ],
  'est-10': [
    {
      id: 'insp-10',
      establishmentId: 'est-10',
      inspectionDate: '2023-09-30',
      violations: [
        { type: 'non-critical', description: 'Equipment not sanitized' }
      ],
      criticalViolations: 0,
      nonCriticalViolations: 1
    }
  ]
};

const mockRecalls: Record<string, Recall[]> = {
  'est-3': [
    {
      id: 'recall-1',
      establishmentId: 'est-3',
      recallDate: '2023-09-15',
      description: 'Possible E. coli contamination in batch #42',
      severity: 'high',
      affectedProducts: ['Burgers', 'Fries']
    }
  ],
  'est-8': [
    {
      id: 'recall-2',
      establishmentId: 'est-8',
      recallDate: '2023-08-25',
      description: 'Listeria risk in deli meats',
      severity: 'medium',
      affectedProducts: ['Deli sandwiches', 'Salads']
    }
  ]
};

export const getNearbyEstablishments = async (latitude: number, longitude: number): Promise<Establishment[]> => {
  // In a real app, this would call the API with the user's location
  // For now, we'll return our mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEstablishments);
    }, 500);
  });
};

export const getEstablishmentDetails = async (id: string): Promise<Establishment> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const establishment = mockEstablishments.find(est => est.id === id);
      if (establishment) {
        resolve(establishment);
      } else {
        reject(new Error('Establishment not found'));
      }
    }, 300);
  });
};

export const getInspections = async (establishmentId: string): Promise<Inspection[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockInspections[establishmentId] || []);
    }, 400);
  });
};

export const getRecalls = async (establishmentId: string): Promise<Recall[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRecalls[establishmentId] || []);
    }, 300);
  });
};
