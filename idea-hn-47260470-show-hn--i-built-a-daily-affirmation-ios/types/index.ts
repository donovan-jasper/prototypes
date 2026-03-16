export interface Affirmation {
  id?: number;
  text: string;
  category: string;
  time_of_day: string;
  energy_level: number;
}

export interface UserSession {
  id?: number;
  timestamp: string;
  affirmation_id: number;
  mood_rating: number;
}

export interface Goal {
  id?: number;
  title: string;
  created_at?: string;
  is_active: number;
}

export interface Streak {
  id?: number;
  date: string;
  is_grace_day: number;
}
