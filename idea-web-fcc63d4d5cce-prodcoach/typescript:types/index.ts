export type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  earned_at?: string;
};
