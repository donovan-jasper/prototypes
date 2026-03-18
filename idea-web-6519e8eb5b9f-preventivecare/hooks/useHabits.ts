import { useState } from 'react';
import { addHabit, getHabits, logHabitCompletion, calculateStreak, getHabitLogsForToday, getHabitLogs } from '../lib/habits';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);

  const loadHabits = async () => {
    const loadedHabits = await getHabits();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const habitsWithStreaksAndCompletion = await Promise.all(
      loadedHabits.map(async habit => {
        const streak = await calculateStreak(habit.id);
        const completedToday = await getHabitLogsForToday(habit.id);
        const logs = await getHabitLogs(habit.id, startDate, endDate);
        return { ...habit, streak, completedToday, logs };
      })
    );
    setHabits(habitsWithStreaksAndCompletion);
  };

  const addNewHabit = async (name, icon, frequency) => {
    const newHabit = await addHabit(name, icon, frequency);
    setHabits([...habits, newHabit]);
  };

  const toggleHabitCompletion = async (habitId) => {
    const date = new Date();
    await logHabitCompletion(habitId, date);
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return { ...habit, completedToday: true };
      }
      return habit;
    });
    setHabits(updatedHabits);
  };

  return {
    habits,
    loadHabits,
    addNewHabit,
    toggleHabitCompletion,
  };
};
