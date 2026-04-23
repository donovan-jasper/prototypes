import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Task } from '../types';
import { loadTasks, saveTasks, loadStreak, saveStreak } from '../lib/storage';
import TaskItem from '../components/TaskItem';
import EncouragementCard from '../components/EncouragementCard';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const loadedTasks = await loadTasks();
      const loadedStreak = await loadStreak();
      setTasks(loadedTasks);
      setStreak(loadedStreak);
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
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setNewTaskText('');
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    // Check if all tasks are completed
    const allCompleted = updatedTasks.every(task => task.completed);
    if (allCompleted) {
      // Update streak
      const newCurrentStreak = streak.currentStreak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);
      setStreak({ currentStreak: newCurrentStreak, longestStreak: newLongestStreak });
      await saveStreak(newCurrentStreak, newLongestStreak);

      // Show encouragement
      setEncouragementMessage(getEncouragementMessage(newCurrentStreak));
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  };

  const getEncouragementMessage = (streakCount: number): string => {
    const messages = [
      "Great job! You're on fire!",
      "Amazing! Keep up the momentum!",
      "Incredible! You're unstoppable!",
      "Fantastic! Your consistency is inspiring!",
      "You're crushing it! Keep going!"
    ];

    return messages[Math.min(streakCount - 1, messages.length - 1)] || messages[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>Current Streak: {streak.currentStreak}</Text>
          <Text style={styles.streakText}>Longest Streak: {streak.longestStreak}</Text>
        </View>
      </View>

      {showEncouragement && (
        <EncouragementCard message={encouragementMessage} />
      )}

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
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default TaskListScreen;
