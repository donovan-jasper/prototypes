import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTaskStore } from '../../store/taskStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { suggestTaskTime } from '../../lib/scheduler';
import { Task } from '../../types';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [businessHours, setBusinessHours] = useState(false);
  const [preferredStart, setPreferredStart] = useState('');
  const [preferredEnd, setPreferredEnd] = useState('');

  const { tasks, addTask, completeTask, rescheduleTask } = useTaskStore();
  const { schedules } = useScheduleStore();

  const activeTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks]);

  const getTaskSuggestion = (task: Task) => {
    const today = new Date();
    return suggestTaskTime(task, today, schedules);
  };

  const handleAddTask = () => {
    if (!title.trim() || !estimatedMinutes.trim()) {
      return;
    }

    const minutes = parseInt(estimatedMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes');
      return;
    }

    const timeConstraints: Task['timeConstraints'] = {};
    
    if (businessHours) {
      timeConstraints.businessHours = true;
    }

    if (preferredStart.trim() && preferredEnd.trim()) {
      const start = parseInt(preferredStart, 10);
      const end = parseInt(preferredEnd, 10);
      
      if (!isNaN(start) && !isNaN(end) && start >= 0 && start < 24 && end > start && end <= 24) {
        timeConstraints.preferredTimeWindow = { start, end };
      }
    }

    addTask({
      title,
      priority,
      estimatedMinutes: minutes,
      timeConstraints: Object.keys(timeConstraints).length > 0 ? timeConstraints : undefined,
    });

    setTitle('');
    setPriority('medium');
    setEstimatedMinutes('');
    setBusinessHours(false);
    setPreferredStart('');
    setPreferredEnd('');
    setModalVisible(false);
  };

  const handleAcceptSuggestion = (task: Task) => {
    const suggestion = getTaskSuggestion(task);
    if (suggestion) {
      rescheduleTask(task.id, suggestion);
      Alert.alert('Scheduled', `Task scheduled for ${format(suggestion, 'h:mm a')}`);
    } else {
      Alert.alert('No Available Time', 'Could not find a suitable time slot for this task');
    }
  };

  const renderRightActions = (task: Task) => {
    return (
      <TouchableOpacity
        style={styles.completeAction}
        onPress={() => completeTask(task.id)}
      >
        <Ionicons name="checkmark-circle" size={32} color="#fff" />
        <Text style={styles.completeActionText}>Complete</Text>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const suggestion = getTaskSuggestion(item);
    const priorityColors = {
      high: '#FF3B30',
      medium: '#FF9500',
      low: '#34C759',
    };

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={[styles.taskCard, { borderLeftColor: priorityColors[item.priority] }]}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.taskDuration}>{item.estimatedMinutes} minutes</Text>
          
          {item.timeConstraints?.businessHours && (
            <Text style={styles.constraint}>Business hours only</Text>
          )}
          
          {item.timeConstraints?.preferredTimeWindow && (
            <Text style={styles.constraint}>
              Preferred: {item.timeConstraints.preferredTimeWindow.start}:00 - {item.timeConstraints.preferredTimeWindow.end}:00
            </Text>
          )}

          {suggestion && (
            <View style={styles.suggestionContainer}>
              <View style={styles.suggestionChip}>
                <Ionicons name="time-outline" size={16} color="#007AFF" />
                <Text style={styles.suggestionText}>
                  Suggested: {format(suggestion, 'h:mm a')} - {format(new Date(suggestion.getTime() + item.estimatedMinutes * 60000), 'h:mm a')}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptSuggestion(item)}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {!suggestion && (
            <Text style={styles.noSuggestion}>No available time slot found</Text>
          )}
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>{activeTasks.length} active</Text>
        </View>

        <FlatList
          data={activeTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkbox-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Add your first task to get started</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Task</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Call dentist, Buy groceries"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.prioritySelector}>
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        priority === p && styles.priorityOptionSelected,
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          priority === p && styles.priorityOptionTextSelected,
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estimated Minutes</Text>
                <TextInput
                  style={styles.input}
                  value={estimatedMinutes}
                  onChangeText={setEstimatedMinutes}
                  placeholder="30"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setBusinessHours(!businessHours)}
                >
                  <Ionicons
                    name={businessHours ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#007AFF"
                  />
                  <Text style={styles.checkboxLabel}>Business hours only (9 AM - 5 PM)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Time Window (Optional)</Text>
                <View style={styles.timeWindowRow}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={preferredStart}
                    onChangeText={setPreferredStart}
                    placeholder="Start (0-23)"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                  <Text style={styles.timeSeparator}>to</Text>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={preferredEnd}
                    onChangeText={setPreferredEnd}
                    placeholder="End (1-24)"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!title.trim() || !estimatedMinutes.trim()) && styles.saveButtonDisabled,
                ]}
                onPress={handleAddTask}
                disabled={!title.trim() || !estimatedMinutes.trim()}
              >
                <Text style={styles.saveButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  taskDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  constraint: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  suggestionContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noSuggestion: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  completeAction: {
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: 12,
    borderRadius: 12,
  },
  completeActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  priorityOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityOptionTextSelected: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  timeWindowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
