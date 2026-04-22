import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

export default function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const dueDateText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No due date';

  return (
    <View style={[styles.card, task.completed && styles.completedCard]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggleComplete?.(task.id, !task.completed)}
      >
        <Text style={styles.checkboxIcon}>{task.completed ? '✅' : '⬜'}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedText]}>{task.title}</Text>
        {task.description && (
          <Text style={[styles.description, task.completed && styles.completedText]}>
            {task.description}
          </Text>
        )}
        <Text style={[styles.dueDate, task.completed && styles.completedText]}>
          Due: {dueDateText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    alignItems: 'center',
  },
  completedCard: {
    backgroundColor: '#F0F0F0',
  },
  checkbox: {
    marginRight: 10,
    padding: 5,
  },
  checkboxIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#888',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});
