import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHabits } from '../store/habits';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabit } = useHabits();

  return (
    <TouchableOpacity onPress={() => toggleHabit(habit.id)}>
      <View style={styles.container}>
        <Text style={[styles.text, habit.completed && styles.completed]}>
          {habit.title}
        </Text>
        <Text style={styles.streak}>Streak: {habit.streak} days</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  streak: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
