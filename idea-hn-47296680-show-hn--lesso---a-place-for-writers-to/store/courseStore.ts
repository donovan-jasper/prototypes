import { create } from 'zustand';
import { Course, Lesson } from '../types';

interface CourseState {
  courses: Course[];
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'lessons'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id' | 'createdAt' | 'courseId'>) => string;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  
  createCourse: (course) =>
    set((state) => ({
      courses: [
        ...state.courses,
        {
          ...course,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          lessons: [],
        },
      ],
    })),
  
  updateCourse: (id, updates) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? { ...course, ...updates } : course
      ),
    })),
  
  deleteCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== id),
    })),

  addLesson: (courseId, lesson) => {
    const lessonId = Math.random().toString(36).substring(7);
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              lessons: [
                ...course.lessons,
                {
                  ...lesson,
                  id: lessonId,
                  courseId,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : course
      ),
    }));
    return lessonId;
  },

  updateLesson: (courseId, lessonId, updates) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              lessons: course.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              ),
            }
          : course
      ),
    })),

  deleteLesson: (courseId, lessonId) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              lessons: course.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : course
      ),
    })),
}));
