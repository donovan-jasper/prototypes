import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TaskContext } from '../context/TaskContext';
import { Colors } from '../constants/Colors';
import { Task } from '../types/TaskTypes';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTaskStatus, deleteTask, updateTask } = useContext(TaskContext);

  const handleToggleComplete = () => {
    updateTaskStatus(task.id, !task.isCompleted);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
      ]
    );
  };

  const handleTogglePin = () => {
    updateTask(task.id, { isPinned: !task.isPinned });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggleComplete}
      >
        {task.isCompleted && <View style={styles.checkmark} />}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.content,
            task.isCompleted && styles.completedText
          ]}
        >
          {task.content}
        </Text>
        <Text style={styles.date}>
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTogglePin}
        >
          <Text style={[
            styles.actionText,
            task.isPinned && styles.pinnedText
          ]}>
            {task.isPinned ? 'Unpin' : 'Pin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 12,
  },
  pinnedText: {
    color: Colors.warningButton,
  },
  deleteButton: {
    backgroundColor: Colors.errorBackground,
  },
  deleteText: {
    color: Colors.error,
    fontSize: 12,
  },
});

export default TaskItem;
