export interface Appointment {
  id: string;
  title: string;
  date: string;
  provider: string;
  memberId?: string;
  completed?: boolean;
  notificationIds?: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth: string;
  relationship: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'checkups' | 'streak';
  target: number;
  progress: number;
  completed: boolean;
  points: number;
}
