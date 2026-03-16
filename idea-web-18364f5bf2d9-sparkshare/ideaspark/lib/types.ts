export interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  ideaId: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  sparkScore: number;
  bio: string;
}
