import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TaskContext } from '../context/TaskContext';
import { Colors } from '../constants/Colors';
import { Task } from '../types/TaskTypes';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTaskStatus, deleteTask, updateTask } = useContext(TaskContext);
  const { isPremium, maxPinnedTasks } = usePremiumStatus();

  const handleCompleteToggle = () => {
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

  const handlePinToggle = () => {
    if (!isPremium && task.isPinned) {
      Alert.alert(
        'Premium Feature',
        'You need to upgrade to Premium to pin tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {} }, // Navigation to premium screen would go here
        ]
      );
      return;
    }

    updateTask(task.id, { isPinned: !task.isPinned });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleCompleteToggle}
      >
        {task.isCompleted && <View style={styles.checkboxInner} />}
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.content,
            task.isCompleted && styles.completedText
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {task.content}
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePinToggle}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.cardBackground,
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
  checkboxInner: {
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
    marginBottom: 8,
  },
  completedText: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 6,
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
