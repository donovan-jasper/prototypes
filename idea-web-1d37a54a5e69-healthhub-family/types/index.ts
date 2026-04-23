export interface FamilyMember {
  id: number;
  name: string;
  birthdate: string;
  relationship: string;
  photoUri?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  familyMemberId: number;
  type: string;
  provider: string;
  date: string;
  location?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: number;
  familyMemberId: number;
  title: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  notificationId?: string;
  active: boolean;
  createdAt: string;
}

export interface Document {
  id: number;
  familyMemberId: number;
  title: string;
  type: string;
  fileUri: string;
  appointmentId?: number;
  uploadDate: string;
}

export interface Medication {
  id: number;
  familyMemberId: number;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  refillDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}
