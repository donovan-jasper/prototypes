import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemoryStore } from '../store/memoryStore';
import QuickActions from './QuickActions';

interface MemoryCardProps {
  memory: {
    id: string;
    title: string;
    description: string;
    trigger_type: string;
    trigger_value: string;
    completed: boolean;
  };
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const { toggleComplete } = useMemoryStore();

  return (
    <TouchableOpacity
      style={[styles.card, memory.completed && styles.completedCard]}
      onPress={() => toggleComplete(memory.id)}
    >
      <Text style={styles.title}>{memory.title}</Text>
      <Text style={styles.description}>{memory.description}</Text>
      <Text style={styles.trigger}>{`${memory.trigger_type}: ${memory.trigger_value}`}</Text>
      <QuickActions memoryId={memory.id} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  trigger: {
    fontSize: 12,
    color: '#999',
  },
});

export default MemoryCard;
