import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTaskStore } from '../../store/taskStore';
import TaskCard from '../../components/TaskCard';
import { TaskStatus } from '../../types';

export default function HistoryScreen() {
  const { tasks, loadHistory } = useTaskStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const completedTasks = tasks.filter(
    t => t.status === TaskStatus.COMPLETED || 
         t.status === TaskStatus.FAILED || 
         t.status === TaskStatus.CANCELLED
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task History</Text>
        <Text style={styles.subtitle}>
          {completedTasks.length} completed tasks
        </Text>
      </View>

      <FlatList
        data={completedTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onCancel={() => {}}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed tasks yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
