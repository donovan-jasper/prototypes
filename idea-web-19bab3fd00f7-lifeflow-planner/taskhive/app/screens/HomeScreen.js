import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import KanbanBoard from '../components/KanbanBoard';
import CalendarScreen from './CalendarScreen';
import AddTaskModal from '../components/AddTaskModal';
import { autoCategorizeTask } from '../utils/task-organizer';
import { getTasks, saveTasks } from '../utils/database';
import { scheduleTaskNotification } from '../utils/notifications';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'calendar'

  useEffect(() => {
    const loadTasks = async () => {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    };
    loadTasks();
  }, []);

  const handleDragEnd = async ({ data }) => {
    setTasks(data);
    await saveTasks(data);
  };

  const handleAddTask = async (task) => {
    const categorizedTask = autoCategorizeTask(task);
    const newTasks = [...tasks, categorizedTask];
    setTasks(newTasks);
    await saveTasks(newTasks);

    if (task.dueDate) {
      await scheduleTaskNotification(categorizedTask);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'kanban' && styles.toggleButtonActive]}
            onPress={() => setViewMode('kanban')}
          >
            <Text style={[styles.toggleText, viewMode === 'kanban' && styles.toggleTextActive]}>
              Board
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} />
      ) : (
        <CalendarScreen />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default HomeScreen;
