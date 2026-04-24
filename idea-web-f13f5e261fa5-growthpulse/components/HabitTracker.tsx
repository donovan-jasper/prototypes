import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { calculateStreak } from '../lib/habitTracker';

interface Habit {
  id: string;
  name: string;
  dates: string[];
  streak: number;
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Meditation', dates: ['2023-10-01', '2023-10-02', '2023-10-03'], streak: 0 },
    { id: '2', name: 'Reading', dates: ['2023-10-01', '2023-10-03'], streak: 0 },
    { id: '3', name: 'Exercise', dates: ['2023-10-01', '2023-10-02'], streak: 0 },
  ]);

  useEffect(() => {
    const updatedHabits = habits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.dates)
    }));
    setHabits(updatedHabits);
  }, []);

  const markHabitComplete = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newDates = [...habit.dates];
        if (!newDates.includes(today)) {
          newDates.push(today);
        }
        return {
          ...habit,
          dates: newDates,
          streak: calculateStreak(newDates)
        };
      }
      return habit;
    });
    setHabits(updatedHabits);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <View style={styles.habitItem}>
      <View style={styles.habitInfo}>
        <Text style={styles.habitName}>{item.name}</Text>
        <Text style={styles.habitStreak}>Current streak: {item.streak} days</Text>
      </View>
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => markHabitComplete(item.id)}
      >
        <Text style={styles.completeButtonText}>Complete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Habits</Text>
      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  habitStreak: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HabitTracker;
