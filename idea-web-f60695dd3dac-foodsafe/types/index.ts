export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  safetyScore: number; // 0-100 scale
  lastInspectionDate: string;
  violationCount: number;
  cuisine: string;
  isPremium?: boolean; // Flag for premium restaurants
  city?: string; // City identifier (nyc, chicago, san_francisco)
}

export interface Inspection {
  id: string;
  restaurantId: string;
  date: string;
  score: number; // 0-100 scale
  violations: Violation[];
  inspectionType?: string; // Routine, complaint-driven, etc.
  inspectorName?: string;
}

export interface Violation {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  code?: string; // Health code reference
  repeatViolation?: boolean;
}

export interface UserList {
  id: string;
  name: string;
  restaurantIds: string[];
  createdAt: string;
  isPublic?: boolean;
  description?: string;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  expiresAt?: string;
  subscriptionType?: 'monthly' | 'annual';
  features?: {
    unlimitedLists: boolean;
    advancedFilters: boolean;
    fullInspectionHistory: boolean;
    violationPhotos: boolean;
    adFree: boolean;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface FilterOptions {
  minScore?: number;
  maxScore?: number;
  cuisine?: string;
  hasRecentInspection?: boolean;
  hasNoViolations?: boolean;
  isAllergyFriendly?: boolean;
  isKidFriendly?: boolean;
}

export interface CityConfig {
  id: string;
  name: string;
  apiBaseUrl: string;
  transformRestaurant: (data: any) => Restaurant;
  transformInspection: (data: any) => Inspection;
}
