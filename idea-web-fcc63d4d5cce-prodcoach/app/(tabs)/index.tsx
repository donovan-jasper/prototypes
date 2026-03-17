import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
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

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[styles.taskItem, item.completed && styles.taskCompleted]}
      onPress={() => toggleTaskCompletion(item.id)}
    >
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
          {item.title}
        </Text>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MotiView 
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800 }}
        style={styles.header}
      >
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.streakText}>🔥 {streakCount} day streak</Text>
      </MotiView>

      <MotiView 
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 200, type: 'spring' }}
        style={styles.encouragementCard}
      >
        <Text style={styles.encouragementText}>{encouragementMessage}</Text>
      </MotiView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/add-task')}>
          <Text style={styles.addTaskButton}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dailyTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks yet. Add your first task to get started!</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.newTaskButton}
        onPress={() => router.push('/add-task')}
      >
        <Text style={styles.newTaskButtonText}>Add New Task</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  streakText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  encouragementCard: {
    backgroundColor: '#4ecdc4',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  encouragementText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionHeader: {
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
  addTaskButton: {
    color: '#4ecdc4',
    fontSize: 16,
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCompleted: {
    backgroundColor: '#e8f4f3',
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ecdc4',
    borderColor: '#4ecdc4',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  newTaskButton: {
    backgroundColor: '#4ecdc4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  newTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
