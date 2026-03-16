import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import { Colors } from '../constants/Colors';
import { AppConstants } from '../constants/AppConstants';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

const HomeScreen: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, refreshTasks } = useTasks();
  const [newTaskContent, setNewTaskContent] = useState('');
  const isPremium = usePremiumStatus();

  const handleAddTask = async () => {
    if (newTaskContent.trim()) {
      await addTask(newTaskContent, 'task');
      setNewTaskContent('');
    }
  };

  const handleCompleteTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateTaskStatus(id, !task.isCompleted);
    }
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
  };

  const navigateToPremium = () => {
    // Navigation logic to PremiumScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aura</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskContent}
          onChangeText={setNewTaskContent}
        />
        <Button title="Add" onPress={handleAddTask} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskItem task={item} onComplete={handleCompleteTask} onDelete={handleDeleteTask} />
        )}
      />
      {!isPremium && tasks.length >= AppConstants.MAX_FREE_GLANCEABLE_TASKS && (
        <TouchableOpacity style={styles.premiumPrompt} onPress={navigateToPremium}>
          <Text style={styles.premiumPromptText}>Upgrade to Premium to pin more tasks to your widgets!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
  },
  premiumPrompt: {
    padding: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    marginTop: 10,
  },
  premiumPromptText: {
    color: Colors.white,
    textAlign: 'center',
  },
});

export default HomeScreen;
