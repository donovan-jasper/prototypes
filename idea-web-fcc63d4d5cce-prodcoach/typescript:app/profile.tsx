import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    longestStreak: 0,
    currentStreak: 0,
  });
  
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    // In a real app, this would fetch from Supabase
    setStats({
      totalTasks: 42,
      completedTasks: 38,
      longestStreak: 12,
      currentStreak: 5,
    });
    
    setAchievements([
      { id: 1, title: 'First Steps', description: 'Complete your first task', earned: true },
      { id: 2, title: 'Week Warrior', description: 'Maintain a 7-day streak', earned: true },
      { id: 3, title: 'Habit Master', description: 'Complete 20 tasks', earned: true },
      { id: 4, title: 'Consistency King', description: 'Maintain a 30-day streak', earned: false },
    ]);
  };

  const renderAchievement = ({ item }: { item: any }) => (
    <View style={[styles.achievementItem, !item.earned && styles.achievementLocked]}>
      <View style={styles.achievementIcon}>
        {item.earned ? (
          <Text style={styles.achievementCheck}>âœ“</Text>
        ) : (
          <Text style={styles.achievementLock}>ðŸ”’</Text>
        )}
      </View>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !item.earned && styles.achievementTitleLocked]}>
          {item.title}
        </Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={require('../assets/images/user-avatar.png')} style={styles.avatar} />
        <Text style={styles.profileName}>Alex Johnson</Text>
        <Text style={styles.profileSubtitle}>MotiMate Explorer</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completedTasks}/{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
      </View>

      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementCheck: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  achievementLock: {
    color: '#fff',
    fontSize: 18,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  achievementTitleLocked: {
    color: '#aaa',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
});
