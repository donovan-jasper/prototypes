import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

const HabitTracker = () => {
  const [habits, setHabits] = useState([
    { id: '1', name: 'Exercise', completed: false },
    { id: '2', name: 'Read', completed: false },
    { id: '3', name: 'Meditate', completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Habits</Text>
      {habits.map((habit) => (
        <TouchableOpacity
          key={habit.id}
          style={styles.habitItem}
          onPress={() => toggleHabit(habit.id)}
        >
          <View style={[styles.checkbox, habit.completed && styles.checked]}>
            {habit.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.habitText, habit.completed && styles.completedText]}>
            {habit.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    minWidth: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});

export default HabitTracker;
