import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../../hooks/useHabits';
import HabitCard from '../../components/HabitCard';
import HealthScore from '../../components/HealthScore';
import { Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
  const router = useRouter();
  const { habits, loadHabits, toggleHabitCompletion } = useHabits();
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      const completedHabits = habits.filter(habit => habit.completedToday).length;
      setHealthScore(Math.round((completedHabits / habits.length) * 100));
    }
  }, [habits]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-habit')}
        >
          <Ionicons name="add" size={24} color="#673ab7" />
        </TouchableOpacity>
      </View>
      <HealthScore score={healthScore} />
      <ScrollView style={styles.habitsContainer}>
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={() => toggleHabitCompletion(habit.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  habitsContainer: {
    marginTop: 16,
  },
});
