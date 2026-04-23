import { create } from 'zustand';
import { Routine, RoutineCompletion, ScheduleBlock } from '../types';
import { adaptRoutine } from '../lib/scheduler';

interface RoutineState {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'streak' | 'lastCompleted' | 'lastSkipReason'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  completeRoutine: (id: string) => void;
  skipRoutine: (id: string, reason: string) => void;
  clearAll: () => void;
  adaptRoutineToSchedule: (routineId: string, schedule: ScheduleBlock[], date: Date) => void;
  getRoutinesForDate: (date: Date) => Routine[];
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],

  addRoutine: (routine) => {
    const newRoutine: Routine = {
      ...routine,
      id: Date.now().toString(),
      streak: 0,
      lastCompleted: null,
      lastSkipReason: null,
    };
    set((state) => ({ routines: [...state.routines, newRoutine] }));
  },

  updateRoutine: (id, updates) => {
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  deleteRoutine: (id) => {
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    }));
  },

  completeRoutine: (id) => {
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id === id) {
          const today = new Date();
          const lastCompleted = r.lastCompleted || new Date(0);
          const isConsecutive = isSameDay(today, addDays(lastCompleted, 1));

          return {
            ...r,
            streak: isConsecutive ? r.streak + 1 : 1,
            lastCompleted: today,
            lastSkipReason: null,
          };
        }
        return r;
      }),
    }));
  },

  skipRoutine: (id, reason) => {
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, lastSkipReason: reason } : r
      ),
    }));
  },

  clearAll: () => {
    set({ routines: [] });
  },

  adaptRoutineToSchedule: (routineId, schedule, date) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (!routine) return;

    const adaptedTime = adaptRoutine(routine, schedule, date);

    if (adaptedTime) {
      set((state) => ({
        routines: state.routines.map((r) =>
          r.id === routineId ? { ...r, suggestedTime: adaptedTime } : r
        ),
      }));
    }
  },

  getRoutinesForDate: (date) => {
    return get().routines.filter(routine => {
      if (!routine.flexible) return false;

      // Check if routine is scheduled for this date
      if (routine.suggestedTime && isSameDay(routine.suggestedTime, date)) {
        return true;
      }

      // Check if routine has a preferred time window
      if (routine.preferredTimeWindow) {
        const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        return routine.daysOfWeek?.includes(dayOfWeek) || true;
      }

      return false;
    });
  },
}));
