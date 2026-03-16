import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const useTasks = (userId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    };

    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTasks((prev) => [payload.new as Task, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === payload.new.id ? (payload.new as Task) : task
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addTask = async (title: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: userId, title, completed: false }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
    } else if (data) {
      setTasks((prev) => [data, ...prev]);
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  return {
    tasks,
    loading,
    addTask,
    toggleTaskCompletion,
  };
};
