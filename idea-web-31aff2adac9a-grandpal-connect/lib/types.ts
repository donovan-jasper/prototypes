export interface Interest {
  id: string;
  name: string;
  category: 'hobby' | 'skill_teach' | 'skill_learn';
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  bio?: string;
  interests: string[];
  photoUrl?: string;
  isPremium: boolean;
  createdAt: number;
  availabilityPreference?: string;
  ageGapPreference?: number;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  initiatorId?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: number;
  read: boolean;
}

export interface Session {
  id: string;
  matchId: string;
  scheduledAt: number;
  duration: number;
  type: 'coffee_chat' | 'skill_lesson' | 'story_time';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: number;
}
