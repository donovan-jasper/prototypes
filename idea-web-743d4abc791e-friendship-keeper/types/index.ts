export interface Relationship {
  id: number;
  name: string;
  category: 'Family' | 'Friends' | 'Professional' | 'Acquaintance';
  frequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  importance: number; // 1-5 scale
  createdAt: string; // ISO date string
  phoneNumber?: string;
  notes?: string;
}

export interface RelationshipWithHealth extends Relationship {
  health: RelationshipHealth;
}

export interface RelationshipHealth {
  score: number; // 0-100
  status: 'healthy' | 'at-risk' | 'neglected';
  daysSinceContact: number;
  isOverdue: boolean;
  lastInteractionTimestamp: string | null;
}

export interface Interaction {
  id: number;
  relationshipId: number;
  type: 'Call' | 'Text' | 'In-person' | 'Video' | 'Other';
  notes: string;
  timestamp: string; // ISO date string
}

export interface Nudge {
  id: number;
  relationshipId: number;
  message: string;
  conversationStarter: string;
  scheduledFor: string; // ISO date string
  dismissed: boolean;
}

export interface ConversationStarter {
  id: number;
  text: string;
  relationshipId: number;
  createdAt: string; // ISO date string
}
