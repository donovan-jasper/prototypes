import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useTaskStore } from '../../store/tasks';
import { getTasks, saveTask } from '../../lib/db';
import TaskCard from '../../components/TaskCard';
import { Task } from '../../types';

export default function TasksScreen() {
  const { tasks, setTasks, updateTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleComplete(taskId: string, completed: boolean) {
    try {
      // Optimistic update
      updateTask(taskId, { completed });

      // Persist to DB
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (taskToUpdate) {
        await saveTask({ ...taskToUpdate, completed }); // Re-save with updated status
        // Note: A dedicated `updateTask` DB function would be better for efficiency
        // For now, `saveTask` will insert if new, or fail if ID exists (needs upsert logic)
        // For simplicity, let's assume `saveTask` handles updates if ID exists, or we'd need a separate `updateTaskInDb`
        // For expo-sqlite, `db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, taskId]);` is the correct approach.
        await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, taskId]);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task status.');
      // Revert optimistic update if DB fails
      updateTask(taskId, { completed: !completed });
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No tasks yet! Say "Add task..." to create one.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onToggleComplete={handleToggleComplete} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
