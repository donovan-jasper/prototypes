export interface Memory {
  id: string;
  title: string;
  description: string;
  trigger_type: 'time' | 'location' | 'routine';
  trigger_value: string;
  completed: boolean;
  created_at: string;
  user_id: string;
  space_id?: string;
}

export interface Space {
  id: string;
  name: string;
  members: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}
