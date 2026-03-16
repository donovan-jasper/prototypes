import { useState, useEffect } from 'react';
import { openDatabase, createGoal, getGoals, updateGoalStatus, deleteGoal as deleteGoalFromDB } from '../services/database';

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      await openDatabase();
      const loadedGoals = await getGoals();
      setGoals(loadedGoals);
    };

    loadGoals();
  }, []);

  const addGoal = async () => {
    const newGoal = await createGoal('New Goal');
    setGoals([...goals, newGoal]);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, ...updates } : goal
    );
    setGoals(updatedGoals);
    // In a real app, you would also update the database here
  };

  const toggleGoalCompletion = async (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updatedGoals);
    await updateGoalStatus(id, !goals.find((goal) => goal.id === id)?.completed);
  };

  const deleteGoal = async (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    await deleteGoalFromDB(id);
  };

  return { goals, addGoal, updateGoal, toggleGoalCompletion, deleteGoal };
};
