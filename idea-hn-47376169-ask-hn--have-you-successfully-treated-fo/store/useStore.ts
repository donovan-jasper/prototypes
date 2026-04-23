import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instructions: string;
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ActiveRoutine {
  routineId: string;
  currentExerciseIndex: number;
  completedExercises: string[];
}

interface UserState {
  userId: string;
  streakCount: number;
  lastCompletedDate: string | null;
  activeRoutine: ActiveRoutine | null;
  routines: Routine[];
  exercises: Exercise[];
}

interface UserActions {
  incrementStreak: () => void;
  resetStreak: () => void;
  startRoutine: (routineId: string) => void;
  completeExercise: (exerciseId: string) => void;
  updateActiveRoutine: (exerciseId: string, completed: boolean) => void;
  loadExercises: (exercises: Exercise[]) => void;
}

const initialExercises: Exercise[] = [
  {
    id: 'chin-tuck',
    name: 'Chin Tuck',
    duration: 10,
    instructions: 'Gently tuck your chin to your chest and hold for the required duration.',
    completed: false
  },
  {
    id: 'shoulder-squeeze',
    name: 'Shoulder Squeeze',
    duration: 8,
    instructions: 'Squeeze your shoulder blades together and hold for the required duration.',
    completed: false
  },
  {
    id: 'neck-roll',
    name: 'Neck Roll',
    duration: 12,
    instructions: 'Gently roll your head in a circular motion to release tension.',
    completed: false
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    duration: 15,
    instructions: 'Arch your back like a cat, then round it like a cow, moving slowly.',
    completed: false
  },
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    duration: 10,
    instructions: 'Sit tall and twist your torso to each side, reaching for your opposite hand.',
    completed: false
  }
];

const initialRoutines: Routine[] = [
  {
    id: 'daily-routine',
    name: 'Daily Routine',
    exercises: initialExercises
  }
];

export const useStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      userId: 'user-123',
      streakCount: 0,
      lastCompletedDate: null,
      activeRoutine: null,
      routines: initialRoutines,
      exercises: initialExercises,

      incrementStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastCompletedDate, streakCount } = get();

        if (lastCompletedDate === today) {
          return; // Already completed today
        }

        if (lastCompletedDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastCompletedDate === yesterdayStr) {
            // Consecutive day
            set({ streakCount: streakCount + 1, lastCompletedDate: today });
          } else {
            // Broken streak
            set({ streakCount: 1, lastCompletedDate: today });
          }
        } else {
          // First completion
          set({ streakCount: 1, lastCompletedDate: today });
        }
      },

      resetStreak: () => {
        set({ streakCount: 0, lastCompletedDate: null });
      },

      startRoutine: (routineId: string) => {
        const routine = get().routines.find(r => r.id === routineId);
        if (routine) {
          set({
            activeRoutine: {
              routineId,
              currentExerciseIndex: 0,
              completedExercises: []
            }
          });
        }
      },

      completeExercise: (exerciseId: string) => {
        const { activeRoutine, exercises } = get();

        if (activeRoutine) {
          // Update the exercise in the active routine
          const updatedExercises = exercises.map(exercise =>
            exercise.id === exerciseId ? { ...exercise, completed: true } : exercise
          );

          // Update the routine in the routines array
          const updatedRoutines = get().routines.map(routine => {
            if (routine.id === activeRoutine.routineId) {
              return {
                ...routine,
                exercises: routine.exercises.map(exercise =>
                  exercise.id === exerciseId ? { ...exercise, completed: true } : exercise
                )
              };
            }
            return routine;
          });

          set({
            exercises: updatedExercises,
            routines: updatedRoutines,
            activeRoutine: {
              ...activeRoutine,
              completedExercises: [...activeRoutine.completedExercises, exerciseId]
            }
          });
        }
      },

      updateActiveRoutine: (exerciseId: string, completed: boolean) => {
        const { activeRoutine, exercises } = get();

        if (activeRoutine) {
          // Update the exercise in the active routine
          const updatedExercises = exercises.map(exercise =>
            exercise.id === exerciseId ? { ...exercise, completed } : exercise
          );

          // Update the routine in the routines array
          const updatedRoutines = get().routines.map(routine => {
            if (routine.id === activeRoutine.routineId) {
              return {
                ...routine,
                exercises: routine.exercises.map(exercise =>
                  exercise.id === exerciseId ? { ...exercise, completed } : exercise
                )
              };
            }
            return routine;
          });

          set({
            exercises: updatedExercises,
            routines: updatedRoutines,
            activeRoutine: {
              ...activeRoutine,
              completedExercises: completed
                ? [...activeRoutine.completedExercises, exerciseId]
                : activeRoutine.completedExercises.filter(id => id !== exerciseId)
            }
          });
        }
      },

      loadExercises: (exercises: Exercise[]) => {
        set({ exercises });
      }
    }),
    {
      name: 'posture-pal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
