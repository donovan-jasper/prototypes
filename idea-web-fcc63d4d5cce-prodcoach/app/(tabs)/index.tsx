import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [encouragementMessage, setEncouragementMessage] = useState('');

  useEffect(() => {
    fetchDailyTasks();
    fetchStreakCount();
    generateEncouragementMessage();
  }, []);

  const fetchDailyTasks = async () => {
    // In a real app, this would fetch from Supabase
    setDailyTasks([
      { id: 1, title: 'Drink water', completed: false },
      { id: 2, title: 'Take a walk', completed: true },
      { id: 3, title: 'Read for 10 min', completed: false },
    ]);
  };

  const fetchStreakCount = async () => {
    // In a real app, this would fetch from Supabase
    setStreakCount(5);
  };

  const generateEncouragementMessage = async () => {
    // In a real app, this would call OpenAI API
    setEncouragementMessage("You're doing amazing! Keep up the great work today.");
  };

  const toggleTaskCompletion = async (taskId: number) => {
    // In a real app, this would update Supabase
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    if (!dailyTasks.find(t => t.id === taskId)?.completed) {
      setStreakCount(prev => prev + 1);
      generateEncouragementMessage();
    }
  };

  const renderTaskItem = ({ item }: { item: any }) => (
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
