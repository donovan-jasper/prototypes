export interface Course {
  id: string;
  title: string;
  description: string;
  price?: number;
  published: boolean;
  createdAt: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[]; // For multiple choice or short answer
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  subscriptionPlan: 'free' | 'pro';
  subscriptionEndsAt?: string;
}

export interface Student {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedLessons: string[]; // Array of lesson IDs
  quizScores: Record<string, number>; // Key is quiz ID, value is score
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE_COURSE' | 'UPDATE_COURSE' | 'DELETE_COURSE' |
          'CREATE_LESSON' | 'UPDATE_LESSON' | 'DELETE_LESSON';
  data: any;
  synced: boolean;
  createdAt: string;
}
