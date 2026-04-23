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
        const isCompleting = !task.completed;
        const today = new Date().toISOString().split('T')[0];
        const lastCompletedDate = task.lastCompleted?.split('T')[0];

        let newStreak = task.streak;

        if (isCompleting) {
          if (lastCompletedDate === today) {
            // Already completed today, just toggle
            return { ...task, completed: !task.completed };
          }

          // Calculate new streak
          if (lastCompletedDate) {
            const lastCompleted = new Date(lastCompletedDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastCompleted.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          // Update global streak
          const newCurrentStreak = currentStreak + 1;
          const newLongestStreak = Math.max(newCurrentStreak, longestStreak);

          setCurrentStreak(newCurrentStreak);
          setLongestStreak(newLongestStreak);
          saveStreak(newCurrentStreak, newLongestStreak);

          return {
            ...task,
            completed: true,
            lastCompleted: new Date().toISOString(),
            streak: newStreak,
          };
        } else {
          // Task was marked incomplete
          return {
            ...task,
            completed: false,
            streak: 0,
          };
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
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>Current Streak: {currentStreak} days</Text>
          <Text style={styles.streakText}>Longest Streak: {longestStreak} days</Text>
        </View>
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
            onToggle={() => toggleTaskCompletion(item.id)}
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default TaskListScreen;
