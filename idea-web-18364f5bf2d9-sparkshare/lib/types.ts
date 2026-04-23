export interface User {
  id: number;
  username: string;
  email: string;
  location?: string;
  created_at: string;
}

export interface Skill {
  id: number;
  user_id: number;
  skill_name: string;
  proficiency: number;
}

export interface Preference {
  id: number;
  user_id: number;
  preference_type: string;
  preference_value: string;
}

export interface Match {
  id: number;
  user1_id: number;
  user2_id: number;
  idea_id?: number;
  match_score: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Message {
  id: number;
  match_id: number;
  sender_id: number;
  content: string;
  read_status: boolean;
  created_at: string;
}

export interface UserProfile {
  user: User;
  skills: Skill[];
  preferences: Preference[];
  sparkScore: number;
  matchScore?: number; // Optional for potential matches
}

export interface FeedbackNotification {
  id: number;
  idea_id: number;
  commenter_id: number;
  commenter_username: string;
  comment_text: string;
  created_at: string;
  unread: boolean;
}
