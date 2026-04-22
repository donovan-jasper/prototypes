import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTaskStore } from '../../store/tasks';
import { getTasks, saveTask, updateTask } from '../../lib/db';
import { extractIntent, parseVoiceCommand } from '../../lib/voice';
import VoiceButton from '../../components/VoiceButton';
import TaskCard from '../../components/TaskCard';

export default function TasksScreen() {
  const { tasks, setTasks, addTask, updateTask: updateTaskStore } = useTaskStore();
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
  }

  async function handleTranscript(text: string) {
    try {
      const intent = extractIntent(text);

      if (intent.type === 'task' && intent.action === 'create') {
        const parsed = await parseVoiceCommand(text);

        if (parsed.type === 'task') {
          const task = {
            id: Date.now().toString(),
            title: parsed.content || text,
            description: parsed.details || '',
            dueDate: parsed.dueDate ? new Date(parsed.dueDate).getTime() : null,
            completed: false,
            createdAt: Date.now(),
          };

          await saveTask(task);
          addTask(task);
          Alert.alert('Task Created', `Task "${task.title}" has been created.`);
        }
      } else {
        Alert.alert('Voice Command', `Received: "${text}"`);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      Alert.alert('Error', 'Failed to process voice command');
    }
  }

  async function handleAddTask() {
    if (!newTaskText.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTaskText.trim(),
      description: '',
      dueDate: null,
      completed: false,
      createdAt: Date.now(),
    };

    await saveTask(task);
    addTask(task);
    setNewTaskText('');
  }

  async function handleToggleComplete(taskId: string, completed: boolean) {
    await updateTask(taskId, { completed });
    updateTaskStore(taskId, { completed });
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={handleToggleComplete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Try saying "Remind me to..."</Text>
          </View>
        }
      />

      <VoiceButton onTranscript={handleTranscript} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});
