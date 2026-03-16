import { create } from 'zustand';
import { getHabits, addHabit as dbAddHabit, toggleHabit as dbToggleHabit } from '../lib/database';
import { Habit } from '../types';

interface HabitsState {
  habits: Habit[];
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
}

export const useHabits = create<HabitsState>((set) => ({
  habits: [],
  fetchHabits: async () => {
    await getHabits((habits) => {
      set({ habits });
    });
  },
  addHabit: async (habit) => {
    await dbAddHabit(habit);
    set((state) => ({ habits: [...state.habits, habit] }));
  },
  toggleHabit: async (id) => {
    await dbToggleHabit(id);
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      ),
    }));
  },
}));
