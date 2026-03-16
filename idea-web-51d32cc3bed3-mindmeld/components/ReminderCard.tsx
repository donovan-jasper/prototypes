import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useReminders } from '../store/reminders';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
}

export default function ReminderCard({ reminder }: ReminderCardProps) {
  const { toggleReminder } = useReminders();

  return (
    <TouchableOpacity onPress={() => toggleReminder(reminder.id)}>
      <View style={styles.container}>
        <Text style={[styles.text, reminder.completed && styles.completed]}>
          {reminder.title}
        </Text>
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
});
