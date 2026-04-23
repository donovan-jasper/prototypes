import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Memory } from '../lib/types';
import { useRouter } from 'expo-router';

interface MemoryCardProps {
  memory: Memory;
  onComplete?: () => void;
  onSnooze?: () => void;
}

export default function MemoryCard({ memory, onComplete, onSnooze }: MemoryCardProps) {
  const router = useRouter();

  const getTriggerText = () => {
    switch (memory.trigger_type) {
      case 'time':
        return `Due: ${new Date(memory.trigger_value).toLocaleString()}`;
      case 'location':
        return `Near: ${memory.trigger_value}`;
      case 'routine':
        return `Routine: ${memory.trigger_value}`;
      default:
        return 'No trigger set';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/memory/${memory.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{memory.title}</Text>
        {memory.completed && <Text style={styles.completedTag}>Completed</Text>}
      </View>

      {memory.description && (
        <Text style={styles.description}>{memory.description}</Text>
      )}

      <Text style={styles.triggerText}>{getTriggerText()}</Text>

      <View style={styles.actions}>
        {!memory.completed && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={onComplete}
            >
              <Text style={styles.actionText}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.snoozeButton]}
              onPress={onSnooze}
            >
              <Text style={styles.actionText}>Snooze</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completedTag: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  triggerText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  snoozeButton: {
    backgroundColor: '#FF9800',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
