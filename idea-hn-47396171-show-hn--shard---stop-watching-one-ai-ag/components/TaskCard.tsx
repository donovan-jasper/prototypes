import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onCancel: (id: string) => void;
  onPress?: (id: string) => void;
}

export default function TaskCard({ task, onCancel, onPress }: TaskCardProps) {
  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED: return '#4CAF50';
      case TaskStatus.RUNNING: return '#2196F3';
      case TaskStatus.FAILED: return '#F44336';
      case TaskStatus.CANCELLED: return '#9E9E9E';
      default: return '#FFC107';
    }
  };

  return (
    <Pressable 
      style={styles.card}
      onPress={() => onPress?.(task.id)}
    >
      <View style={styles.header}>
        <Text style={styles.prompt} numberOfLines={2}>
          {task.prompt}
        </Text>
        {task.status === TaskStatus.RUNNING && (
          <Pressable 
            testID="cancel-button"
            onPress={() => onCancel(task.id)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Text>
      </View>

      {task.status === TaskStatus.RUNNING && task.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View 
            testID="progress-bar"
            style={[styles.progressBar, { width: `${task.progress * 100}%` }]} 
          />
        </View>
      )}

      {task.result && (
        <Text style={styles.preview} numberOfLines={3}>
          {task.result}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  preview: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
