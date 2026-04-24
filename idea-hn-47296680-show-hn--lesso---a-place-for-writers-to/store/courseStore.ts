import { create } from 'zustand';
import { Course, Lesson } from '../types';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('coursekit.db');

interface CourseState {
  courses: Course[];
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'lessons'>) => Promise<string>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addLesson: (courseId: string, lesson: Omit<Lesson, 'id' | 'createdAt' | 'courseId'>) => Promise<string>;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  reorderLessons: (courseId: string, lessons: Lesson[]) => Promise<void>;
  loadCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],

  // Initialize database tables if they don't exist
  initializeDB: async () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS courses (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              price REAL,
              published INTEGER,
              createdAt TEXT NOT NULL
            );`
          );
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS lessons (
              id TEXT PRIMARY KEY,
              courseId TEXT NOT NULL,
              title TEXT NOT NULL,
              content TEXT,
              order INTEGER NOT NULL,
              createdAt TEXT NOT NULL,
              FOREIGN KEY (courseId) REFERENCES courses(id)
            );`
          );
        },
        error => {
          console.error('DB initialization error:', error);
          reject(error);
        },
        () => resolve(true)
      );
    });
  },

  loadCourses: async () => {
    await get().initializeDB();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'SELECT * FROM courses ORDER BY createdAt DESC',
            [],
            (_, { rows: { _array: courses } }) => {
              const coursePromises = courses.map(course =>
                new Promise<Course>((resolveCourse) => {
                  tx.executeSql(
                    'SELECT * FROM lessons WHERE courseId = ? ORDER BY "order"',
                    [course.id],
                    (_, { rows: { _array: lessons } }) => {
                      resolveCourse({
                        ...course,
                        published: !!course.published,
                        price: course.price ? parseFloat(course.price) : 0,
                        lessons: lessons.map(lesson => ({
                          ...lesson,
                          order: Number(lesson.order)
                        }))
                      });
                    }
                  );
                })
              );

              Promise.all(coursePromises).then(loadedCourses => {
                set({ courses: loadedCourses });
                resolve(loadedCourses);
              });
            }
          );
        },
        error => {
          console.error('Error loading courses:', error);
          reject(error);
        }
      );
    });
  },

  createCourse: async (course) => {
    const id = Math.random().toString(36).substring(7);
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'INSERT INTO courses (id, title, description, price, published, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, course.title, course.description || '', course.price || 0, 0, createdAt],
            () => {
              const newCourse: Course = {
                id,
                title: course.title,
                description: course.description || '',
                price: course.price || 0,
                published: false,
                createdAt,
                lessons: []
              };

              set(state => ({
                courses: [newCourse, ...state.courses]
              }));

              resolve(id);
            }
          );
        },
        error => {
          console.error('Error creating course:', error);
          reject(error);
        }
      );
    });
  },

  updateCourse: async (id, updates) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          tx.executeSql(
            `UPDATE courses SET ${fields} WHERE id = ?`,
            [...values, id],
            () => {
              set(state => ({
                courses: state.courses.map(course =>
                  course.id === id ? { ...course, ...updates } : course
                )
              }));
              resolve();
            }
          );
        },
        error => {
          console.error('Error updating course:', error);
          reject(error);
        }
      );
    });
  },

  deleteCourse: async (id) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'DELETE FROM lessons WHERE courseId = ?',
            [id],
            () => {
              tx.executeSql(
                'DELETE FROM courses WHERE id = ?',
                [id],
                () => {
                  set(state => ({
                    courses: state.courses.filter(course => course.id !== id)
                  }));
                  resolve();
                }
              );
            }
          );
        },
        error => {
          console.error('Error deleting course:', error);
          reject(error);
        }
      );
    });
  },

  addLesson: async (courseId, lesson) => {
    const id = Math.random().toString(36).substring(7);
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'INSERT INTO lessons (id, courseId, title, content, order, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, courseId, lesson.title, lesson.content || '', lesson.order, createdAt],
            () => {
              const newLesson: Lesson = {
                id,
                courseId,
                title: lesson.title,
                content: lesson.content || '',
                order: lesson.order,
                createdAt
              };

              set(state => ({
                courses: state.courses.map(course =>
                  course.id === courseId
                    ? {
                        ...course,
                        lessons: [...course.lessons, newLesson].sort((a, b) => a.order - b.order)
                      }
                    : course
                )
              }));

              resolve(id);
            }
          );
        },
        error => {
          console.error('Error adding lesson:', error);
          reject(error);
        }
      );
    });
  },

  updateLesson: async (courseId, lessonId, updates) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = Object.values(updates);

          tx.executeSql(
            `UPDATE lessons SET ${fields} WHERE id = ?`,
            [...values, lessonId],
            () => {
              set(state => ({
                courses: state.courses.map(course =>
                  course.id === courseId
                    ? {
                        ...course,
                        lessons: course.lessons.map(lesson =>
                          lesson.id === lessonId ? { ...lesson, ...updates } : lesson
                        )
                      }
                    : course
                )
              }));
              resolve();
            }
          );
        },
        error => {
          console.error('Error updating lesson:', error);
          reject(error);
        }
      );
    });
  },

  deleteLesson: async (courseId, lessonId) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'DELETE FROM lessons WHERE id = ?',
            [lessonId],
            () => {
              set(state => ({
                courses: state.courses.map(course =>
                  course.id === courseId
                    ? {
                        ...course,
                        lessons: course.lessons.filter(lesson => lesson.id !== lessonId)
                      }
                    : course
                )
              }));
              resolve();
            }
          );
        },
        error => {
          console.error('Error deleting lesson:', error);
          reject(error);
        }
      );
    });
  },

  reorderLessons: async (courseId, lessons) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          lessons.forEach((lesson, index) => {
            tx.executeSql(
              'UPDATE lessons SET "order" = ? WHERE id = ?',
              [index, lesson.id]
            );
          });

          set(state => ({
            courses: state.courses.map(course =>
              course.id === courseId
                ? {
                    ...course,
                    lessons: lessons.map((lesson, index) => ({
                      ...lesson,
                      order: index
                    }))
                  }
                : course
            )
          }));

          resolve();
        },
        error => {
          console.error('Error reordering lessons:', error);
          reject(error);
        }
      );
    });
  }
}));
