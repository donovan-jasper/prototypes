import { create } from 'zustand';
import { Routine } from '../types';

interface RoutineState {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'streak'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  completeRoutine: (id: string) => void;
  skipRoutine: (id: string, reason: string) => void;
  clearAll: () => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  
  addRoutine: (routine) => {
    const newRoutine: Routine = {
      ...routine,
      id: Date.now().toString(),
      streak: 0,
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
      routines: state.routines.map((r) =>
        r.id === id
          ? { ...r, streak: r.streak + 1, lastCompleted: new Date() }
          : r
      ),
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
}));
