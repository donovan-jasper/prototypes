import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMemoryStore } from '../store/memoryStore';

interface QuickActionsProps {
  memoryId: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ memoryId }) => {
  const { snoozeMemory, deleteMemory } = useMemoryStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => snoozeMemory(memoryId)}
      >
        <Text style={styles.actionText}>Snooze</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => deleteMemory(memoryId)}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
  },
});

export default QuickActions;
