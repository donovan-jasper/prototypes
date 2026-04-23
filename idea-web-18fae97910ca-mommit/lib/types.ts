export type TriggerType = 'time' | 'location' | 'routine';

export interface Memory {
  id: string;
  title: string;
  description: string;
  trigger_type: TriggerType;
  trigger_value: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface Space {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  members: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
