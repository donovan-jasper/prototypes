import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';

interface TaskCardProps {
  task: {
    id: string;
    type: string;
    status: string;
    progress?: number;
    filesProcessed?: number;
    createdAt: number;
  };
  onCancel?: (taskId: string) => void;
}

export function TaskCard({ task, onCancel }: TaskCardProps) {
  const getTaskTitle = (type) => {
    switch (type) {
      case 'organize_photos':
        return 'Organize Photos';
      case 'process_documents':
        return 'Process Documents';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTaskTitle(task.type)}</Text>
      <Text style={styles.status}>{task.status}</Text>

      {task.progress !== undefined && (
        <ProgressBar progress={task.progress} />
      )}

      {task.filesProcessed !== undefined && (
        <Text style={styles.filesProcessed}>{task.filesProcessed} files processed</Text>
      )}

      {task.status === 'pending' && onCancel && (
        <Button title="Cancel" onPress={() => onCancel(task.id)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
  filesProcessed: {
    fontSize: 14,
    marginTop: 5,
  },
});
