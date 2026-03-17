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
import { format, startOfDay, endOfDay, isToday, isBefore } from 'date-fns';
import { useTaskStore } from '../../store/taskStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { suggestTaskTime } from '../../lib/scheduler';
import { Task } from '../../types';

type FilterType = 'all' | 'today' | 'overdue';
type PriorityType = 'high' | 'medium' | 'low';

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [duration, setDuration] = useState('');
  const [businessHours, setBusinessHours] = useState(false);
  const [preferredStart, setPreferredStart] = useState('');
  const [preferredEnd, setPreferredEnd] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const { tasks, addTask, completeTask, deleteTask } = useTaskStore();
  const { schedules } = useScheduleStore();

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const todaySchedules = schedules.filter(
    (s) => s.startTime >= todayStart && s.startTime <= todayEnd
  );

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((t) => !t.completed);

    if (filter === 'today') {
      filtered = filtered.filter(
        (t) => t.scheduledFor && isToday(t.scheduledFor)
      );
    } else if (filter === 'overdue') {
      filtered = filtered.filter(
        (t) =>
          t.scheduledFor &&
          isBefore(t.scheduledFor, todayStart) &&
          !isToday(t.scheduledFor)
      );
    }

    return filtered;
  }, [tasks, filter, todayStart]);

  const groupedTasks = useMemo(() => {
    const high = filteredTasks.filter((t) => t.priority === 'high');
    const medium = filteredTasks.filter((t) => t.priority === 'medium');
    const low = filteredTasks.filter((t) => t.priority === 'low');

    return { high, medium, low };
  }, [filteredTasks]);

  const handleAddTask = () => {
    if (!title.trim() || !duration.trim()) {
      return;
    }

    const estimatedMinutes = parseInt(duration, 10);
    if (isNaN(estimatedMinutes) || estimatedMinutes <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in minutes');
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
      estimatedMinutes,
      timeConstraints: Object.keys(timeConstraints).length > 0 ? timeConstraints : undefined,
    });

    setTitle('');
    setPriority('medium');
    setDuration('');
    setBusinessHours(false);
    setPreferredStart('');
    setPreferredEnd('');
    setModalVisible(false);
  };

  const getSuggestedTime = (task: Task): string | null => {
    const suggestion = suggestTaskTime(task, today, todaySchedules);
    if (!suggestion) return null;
    return format(suggestion, 'h:mm a');
  };

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleDelete = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) },
    ]);
  };

  const renderTaskCard = ({ item }: { item: Task }) => {
    const suggestedTime = getSuggestedTime(item);

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <View
              style={[
                styles.priorityDot,
                item.priority === 'high' && styles.priorityHigh,
                item.priority === 'medium' && styles.priorityMedium,
                item.priority === 'low' && styles.priorityLow,
              ]}
            />
            <Text style={styles.taskTitle}>{item.title}</Text>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => handleComplete(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.taskDetailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.taskDetailText}>{item.estimatedMinutes} min</Text>
          </View>

          {suggestedTime && (
            <View style={styles.suggestedChip}>
              <Ionicons name="bulb-outline" size={14} color="#007AFF" />
              <Text style={styles.suggestedText}>Suggested: {suggestedTime}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPrioritySection = (
    priorityLevel: PriorityType,
    tasks: Task[],
    label: string
  ) => {
    if (tasks.length === 0) return null;

    return (
      <View style={styles.prioritySection}>
        <Text style={styles.priorityLabel}>{label}</Text>
        <FlatList
          data={tasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'today' && styles.filterTabActive]}
            onPress={() => setFilter('today')}
          >
            <Text style={[styles.filterTabText, filter === 'today' && styles.filterTabTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'overdue' && styles.filterTabActive]}
            onPress={() => setFilter('overdue')}
          >
            <Text
              style={[styles.filterTabText, filter === 'overdue' && styles.filterTabTextActive]}
            >
              Overdue
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[1]}
        renderItem={() => (
          <View>
            {renderPrioritySection('high', groupedTasks.high, 'High Priority')}
            {renderPrioritySection('medium', groupedTasks.medium, 'Medium Priority')}
            {renderPrioritySection('low', groupedTasks.low, 'Low Priority')}
          </View>
        )}
        keyExtractor={() => 'tasks'}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
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
              <View style={styles.priorityPicker}>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    priority === 'high' && styles.priorityOptionActive,
                  ]}
                  onPress={() => setPriority('high')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      priority === 'high' && styles.priorityOptionTextActive,
                    ]}
                  >
                    High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    priority === 'medium' && styles.priorityOptionActive,
                  ]}
                  onPress={() => setPriority('medium')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      priority === 'medium' && styles.priorityOptionTextActive,
                    ]}
                  >
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    priority === 'low' && styles.priorityOptionActive,
                  ]}
                  onPress={() => setPriority('low')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      priority === 'low' && styles.priorityOptionTextActive,
                    ]}
                  >
                    Low
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 30"
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
              <Text style={styles.label}>Preferred Time Window (optional)</Text>
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
                (!title.trim() || !duration.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleAddTask}
              disabled={!title.trim() || !duration.trim()}
            >
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  prioritySection: {
    marginBottom: 24,
  },
  priorityLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  priorityHigh: {
    backgroundColor: '#F44336',
  },
  priorityMedium: {
    backgroundColor: '#FF9800',
  },
  priorityLow: {
    backgroundColor: '#4CAF50',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#666',
  },
  suggestedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestedText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
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
  priorityPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  priorityOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityOptionTextActive: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
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
