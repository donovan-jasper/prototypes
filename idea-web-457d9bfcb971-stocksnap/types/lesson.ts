export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  quiz: QuizQuestion[];
  isPremium: boolean;
  progress?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
