import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useTaskStore } from '../../store/taskStore';
import TaskCard from '../../components/TaskCard';
import NotificationPermissionBanner from '../../components/NotificationPermissionBanner';
import { TaskStatus } from '../../types';
import { router } from 'expo-router';

export default function TaskQueueScreen() {
  const { tasks, addTask, cancelTask, initialize, subscription } = useTaskStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    initialize();
  }, []);

  const activeTasks = tasks.filter(
    t => t.status === TaskStatus.PENDING || t.status === TaskStatus.RUNNING
  );

  const handleAddTask = () => {
    if (prompt.trim()) {
      addTask(prompt.trim());
      setPrompt('');
    }
  };

  const canAddTask = activeTasks.length < subscription.maxParallelTasks;

  return (
    <View style={styles.container}>
      <NotificationPermissionBanner />

      <View style={styles.header}>
        <Text style={styles.title}>Active Tasks</Text>
        <Text style={styles.subtitle}>
          {activeTasks.length} / {subscription.maxParallelTasks} running
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to do?"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.addButton, !canAddTask && styles.addButtonDisabled]}
          onPress={handleAddTask}
          disabled={!canAddTask || !prompt.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </Pressable>
      </View>

      {!canAddTask && (
        <Text style={styles.limitWarning}>
          Task limit reached. Upgrade to Pro for more parallel tasks.
        </Text>
      )}

      <FlatList
        data={activeTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onCancel={cancelTask}
            onPress={(id) => router.push(`/task/${id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active tasks. Add one above!</Text>
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
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  limitWarning: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
