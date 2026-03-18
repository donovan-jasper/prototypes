import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTaskStore } from '../../store/taskStore';
import TaskCard from '../../components/TaskCard';
import { TaskStatus } from '../../types';

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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          style={[styles.addButton, (!canAddTask || !prompt.trim()) && styles.addButtonDisabled]}
          onPress={handleAddTask}
          disabled={!canAddTask || !prompt.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </Pressable>
      </View>

      {!canAddTask && (
        <View style={styles.limitWarningContainer}>
          <Text style={styles.limitWarning}>
            Task limit reached. Upgrade to Pro for more parallel tasks.
          </Text>
        </View>
      )}

      <FlatList
        data={activeTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onCancel={cancelTask}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active tasks. Add one above!</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
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
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  limitWarningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  limitWarning: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
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
