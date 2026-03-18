export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  safetyScore: number;
  lastInspectionDate: string;
  violationCount: number;
  cuisine: string;
}

export interface Inspection {
  id: string;
  restaurantId: string;
  date: string;
  score: number;
  violations: Violation[];
}

export interface Violation {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserList {
  id: string;
  name: string;
  restaurantIds: string[];
  createdAt: string;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  expiresAt?: string;
}
