import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Task } from '../types';
import { loadTasks, saveTasks, loadStats, saveStats } from '../lib/storage';

export default function AddTaskScreen() {
  const router = useRouter();
  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsLoading(true);
    
    try {
      const tasks = await loadTasks();
      const newTask: Task = {
        id: Date.now(),
        title: taskTitle.trim(),
        completed: false,
        created_at: new Date().toISOString(),
      };
      
      const updatedTasks = [newTask, ...tasks];
      await saveTasks(updatedTasks);
      
      const { totalTasks, completedTasks } = await loadStats();
      await saveStats(totalTasks + 1, completedTasks);
      
      router.back();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Task</Text>
      
      <TextInput
        style={styles.input}
        placeholder="What do you want to accomplish?"
        value={taskTitle}
        onChangeText={setTaskTitle}
        multiline
        textAlignVertical="top"
      />
      
      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.addButtonDisabled]} 
        onPress={handleAddTask}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>
          {isLoading ? 'Adding...' : 'Add Task'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonDisabled: {
    backgroundColor: '#a0ded8',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
});
