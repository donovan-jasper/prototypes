import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { saveWidgetData, loadWidgetData } from '../utils/database';

interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface HabitTrackerProps {
  widgetId: string;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ widgetId }) => {
  const { currentTheme } = useAppStore();
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Drink water', completed: false },
    { id: '2', name: 'Exercise', completed: false },
    { id: '3', name: 'Read', completed: false },
  ]);

  useEffect(() => {
    const loadData = async () => {
      const savedData = await loadWidgetData(widgetId);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (Array.isArray(parsedData)) {
            setHabits(parsedData);
          }
        } catch (e) {
          console.error('Error parsing habit data:', e);
        }
      }
    };
    loadData();
  }, [widgetId]);

  const toggleHabit = async (habitId: string) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    await saveWidgetData(widgetId, JSON.stringify(updatedHabits));
  };

  const resetHabits = async () => {
    const resetHabits = habits.map(habit => ({ ...habit, completed: false }));
    setHabits(resetHabits);
    await saveWidgetData(widgetId, JSON.stringify(resetHabits));
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.widgetBackground }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Daily Habits</Text>

      <View style={styles.habitsContainer}>
        {habits.map(habit => (
          <TouchableOpacity
            key={habit.id}
            style={[
              styles.habitItem,
              habit.completed && { backgroundColor: currentTheme.text },
              { borderColor: currentTheme.text }
            ]}
            onPress={() => toggleHabit(habit.id)}
          >
            <Text style={[
              styles.habitText,
              habit.completed && { color: currentTheme.widgetBackground },
              { color: currentTheme.text }
            ]}>
              {habit.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: currentTheme.text }]}
        onPress={resetHabits}
      >
        <Text style={[styles.resetButtonText, { color: currentTheme.widgetBackground }]}>
          Reset for Today
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  habitsContainer: {
    marginBottom: 16,
  },
  habitItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  habitText: {
    fontSize: 16,
  },
  resetButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HabitTracker;
