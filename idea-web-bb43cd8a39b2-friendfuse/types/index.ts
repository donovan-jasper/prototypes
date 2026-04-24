export type InteractionType = 'text' | 'call' | 'hangout';

export interface Interaction {
  id: number;
  friend_id: string;
  type: InteractionType;
  timestamp: string;
  notes: string;
}

export interface Challenge {
  id: number;
  friend_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}
