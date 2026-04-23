import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Task } from '../../types';
import { loadTasks, saveTasks, loadStreak, saveStreak, loadStats, saveStats, loadAchievements, saveAchievements } from '../../lib/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const tasks = await loadTasks();

    // Check if this is first launch (no tasks exist)
    if (tasks.length === 0) {
      // Create sample tasks
      const sampleTasks: Task[] = [
        {
          id: Date.now(),
          title: 'Drink 8 glasses of water',
          completed: false,
          created_at: new Date().toISOString(),
        },
        {
          id: Date.now() + 1,
          title: 'Take a 10-minute walk',
          completed: false,
          created_at: new Date().toISOString(),
        },
        {
          id: Date.now() + 2,
          title: 'Read for 15 minutes',
          completed: false,
          created_at: new Date().toISOString(),
        },
      ];

      // Save sample tasks
      await saveTasks(sampleTasks);
      setDailyTasks(sampleTasks);

      // Initialize streak to 0
      await saveStreak(0, 0);
      setStreakCount(0);
      setLongestStreak(0);

      // Initialize stats
      await saveStats(3, 0);
    } else {
      // Load existing data
      const { currentStreak, longestStreak } = await loadStreak();
      setDailyTasks(tasks);
      setStreakCount(currentStreak);
      setLongestStreak(longestStreak);
    }

    generateEncouragementMessage(streakCount);
  };

  const generateEncouragementMessage = (streak: number) => {
    const messages = [
      "You're doing amazing! Keep up the great work today.",
      "Every task completed is a step forward. You've got this!",
      "Your consistency is inspiring. Keep building those habits!",
      `${streak} days strong! You're on fire! 🔥`,
      "Small wins lead to big victories. Keep going!",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setEncouragementMessage(randomMessage);
  };

  const checkAndUpdateAchievements = async (completedCount: number, currentStreak: number) => {
    const achievements = await loadAchievements();
    let updated = false;

    // First Steps - Complete first task
    if (completedCount >= 1 && !achievements[0].earned) {
      achievements[0].earned = true;
      achievements[0].earned_at = new Date().toISOString();
      updated = true;
    }

    // Week Warrior - 7 day streak
    if (currentStreak >= 7 && !achievements[1].earned) {
      achievements[1].earned = true;
      achievements[1].earned_at = new Date().toISOString();
      updated = true;
    }

    // Habit Master - 20 completed tasks
    if (completedCount >= 20 && !achievements[2].earned) {
      achievements[2].earned = true;
      achievements[2].earned_at = new Date().toISOString();
      updated = true;
    }

    // Consistency King - 30 day streak
    if (currentStreak >= 30 && !achievements[3].earned) {
      achievements[3].earned = true;
      achievements[3].earned_at = new Date().toISOString();
      updated = true;
    }

    if (updated) {
      await saveAchievements(achievements);
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    const updatedTasks = dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    setDailyTasks(updatedTasks);
    await saveTasks(updatedTasks);

    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      const newStreak = streakCount + 1;
      const newLongest = Math.max(newStreak, longestStreak);

      setStreakCount(newStreak);
      setLongestStreak(newLongest);
      await saveStreak(newStreak, newLongest);

      generateEncouragementMessage(newStreak);

      const { totalTasks, completedTasks } = await loadStats();
      const newCompletedTasks = completedTasks + 1;
      await saveStats(totalTasks, newCompletedTasks);

      await checkAndUpdateAchievements(newCompletedTasks, newStreak);
    }
  };

  const addNewTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    };

    const updatedTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedTasks);
    await saveTasks(updatedTasks);

    const { totalTasks, completedTasks } = await loadStats();
    await saveStats(totalTasks + 1, completedTasks);

    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskItem, item.completed && styles.taskCompleted]}
      onPress={() => toggleTaskCompletion(item.id)}
    >
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
          {item.title}
        </Text>
        <Text style={styles.taskDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.taskStatus}>
        {item.completed ? (
          <Image
            source={require('../../assets/images/check-circle.png')}
            style={styles.checkIcon}
          />
        ) : (
          <View style={styles.uncheckedCircle} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>MotiMate</Text>
        <Text style={styles.streakText}>Current Streak: {streakCount} days</Text>
      </View>

      <MotiView
        style={styles.encouragementCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Text style={styles.encouragementText}>{encouragementMessage}</Text>
      </MotiView>

      <View style={styles.tasksHeader}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddTask(!showAddTask)}
        >
          <Text style={styles.addButtonText}>{showAddTask ? 'Cancel' : 'Add Task'}</Text>
        </TouchableOpacity>
      </View>

      {showAddTask && (
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.taskInput}
            placeholder="Enter task title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            autoFocus
          />
          <TouchableOpacity style={styles.submitButton} onPress={addNewTask}>
            <Text style={styles.submitButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={dailyTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.taskList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  streakText: {
    fontSize: 16,
    color: '#666',
  },
  encouragementCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  encouragementText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addTaskContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskList: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCompleted: {
    backgroundColor: '#e8f5e9',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskStatus: {
    marginLeft: 10,
  },
  checkIcon: {
    width: 24,
    height: 24,
    tintColor: '#4CAF50',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});
