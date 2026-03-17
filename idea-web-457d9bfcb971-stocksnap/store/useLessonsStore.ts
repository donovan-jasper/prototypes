import { create } from 'zustand';
import { Lesson } from '../types/lesson';

interface LessonsState {
  completedLessons: string[];
  currentLesson: Lesson | null;
  setCompletedLessons: (lessons: string[]) => void;
  addCompletedLesson: (lessonId: string) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
}

export const useLessonsStore = create<LessonsState>((set) => ({
  completedLessons: [],
  currentLesson: null,
  setCompletedLessons: (lessons) => set({ completedLessons: lessons }),
  addCompletedLesson: (lessonId) =>
    set((state) => ({
      completedLessons: [...state.completedLessons, lessonId]
    })),
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
}));
