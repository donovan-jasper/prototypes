export interface Establishment {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  safetyScore: string;
  lastInspectionDate: string;
  cuisineType: string;
  isOpen: boolean;
}

export interface Inspection {
  id: string;
  establishmentId: string;
  inspectionDate: string;
  violations: {
    type: 'critical' | 'non-critical';
    description: string;
  }[];
  criticalViolations: number;
  nonCriticalViolations: number;
}

export interface SavedLocation {
  establishmentId: string;
  name: string;
  address: string;
  safetyScore: string;
  lastInspectionDate: string;
  savedDate: string;
}

export interface RecallAlert {
  id: number;
  establishmentId: string;
  recallDate: string;
  description: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export interface Recall {
  id: string;
  establishmentId: string;
  recallDate: string;
  description: string;
  severity: string;
}
