import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Task } from '../types';
import { loadTasks, saveTasks, loadStreak, saveStreak } from '../lib/storage';
import TaskItem from '../components/TaskItem';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const loadedTasks = await loadTasks();
      const { currentStreak, longestStreak } = await loadStreak();
      setTasks(loadedTasks);
      setCurrentStreak(currentStreak);
      setLongestStreak(longestStreak);
    };
    loadData();
  }, []);

  const addTask = async () => {
    if (newTaskText.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
      lastCompleted: null,
      streak: 0,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setNewTaskText('');
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newCompletedStatus = !task.completed;
        const today = new Date().toISOString().split('T')[0];
        const lastCompletedDate = task.lastCompleted?.split('T')[0];

        let newStreak = task.streak;

        if (newCompletedStatus) {
          if (lastCompletedDate === today) {
            // Already completed today, just toggle
            return { ...task, completed: newCompletedStatus };
          }

          if (lastCompletedDate) {
            const lastCompleted = new Date(task.lastCompleted);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastCompleted.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
              // Consecutive day
              newStreak += 1;
            } else {
              // Broken streak
              newStreak = 1;
            }
          } else {
            // First completion
            newStreak = 1;
          }

          // Update streaks
          const newCurrentStreak = newStreak;
          const newLongestStreak = Math.max(newCurrentStreak, longestStreak);

          setCurrentStreak(newCurrentStreak);
          setLongestStreak(newLongestStreak);
          saveStreak(newCurrentStreak, newLongestStreak);

          return {
            ...task,
            completed: newCompletedStatus,
            lastCompleted: new Date().toISOString(),
            streak: newStreak
          };
        } else {
          // Task marked incomplete
          return { ...task, completed: newCompletedStatus };
        }
      }
      return task;
    });

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Current Streak: {currentStreak} days</Text>
        <Text style={styles.streakText}>Longest Streak: {longestStreak} days</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggleComplete={() => toggleTaskCompletion(item.id)}
            onDelete={() => deleteTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one to get started!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TaskListScreen;
