export interface Relationship {
  id: number;
  name: string;
  category: 'Family' | 'Friends' | 'Professional' | 'Acquaintance';
  frequency: 'Weekly' | 'Monthly' | 'Quarterly';
  importance: number;
  createdAt: string;
  notes?: string;
}

export interface Interaction {
  id: number;
  relationshipId: number;
  type: 'Call' | 'Text' | 'In-person' | 'Video' | 'Other';
  notes: string;
  timestamp: string;
}

export interface Nudge {
  id: number;
  relationshipId: number;
  message: string;
  conversationStarter: string;
  scheduledFor: string;
  dismissed: boolean;
}

export interface RelationshipHealth {
  score: number;
  status: 'healthy' | 'at-risk' | 'neglected';
  daysSinceContact: number;
  isOverdue: boolean;
}

export interface RelationshipWithHealth extends Relationship {
  health: RelationshipHealth;
  lastInteraction?: Interaction;
}
