import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { TaskItem } from '../components/TaskItem';
import { getTasks, saveTasks } from '../lib/storage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  streak: number;
  lastCompleted: string | null;
}

export const TaskListScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const storedTasks = await getTasks();
    setTasks(storedTasks);
  };

  const handleAddTask = async () => {
    if (newTaskText.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      streak: 0,
      lastCompleted: null,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setNewTaskText('');
  };

  const handleToggleComplete = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const today = new Date().toISOString().split('T')[0];
        let newStreak = task.streak;
        let lastCompleted = task.lastCompleted;

        if (!task.completed) {
          // Task being completed
          if (task.lastCompleted === today) {
            // Already completed today - no change
            return task;
          }

          if (task.lastCompleted) {
            const lastDate = new Date(task.lastCompleted);
            const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive day
              newStreak = task.streak + 1;
            } else if (diffDays > 1) {
              // Broken streak
              newStreak = 1;
            }
          } else {
            // First completion
            newStreak = 1;
          }

          lastCompleted = today;
        } else {
          // Task being uncompleted
          if (task.lastCompleted === today) {
            // Undoing today's completion
            newStreak = task.streak - 1;
            lastCompleted = null;
          }
        }

        return {
          ...task,
          completed: !task.completed,
          streak: newStreak,
          lastCompleted: lastCompleted,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggleComplete={() => handleToggleComplete(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});
