import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TaskContext } from '../context/TaskContext';
import { Colors } from '../constants/Colors';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface TaskItemProps {
  task: {
    id: number;
    content: string;
    type: 'task' | 'note' | 'reminder';
    isCompleted: boolean;
    isPinned: boolean;
    createdAt: string;
    dueDate?: string;
  };
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTaskStatus, deleteTask, updateTask, tasks } = useContext(TaskContext);
  const { isPremium, maxPinnedTasks } = usePremiumStatus();

  const handleToggleComplete = () => {
    updateTaskStatus(task.id, !task.isCompleted);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) }
      ]
    );
  };

  const handleTogglePin = () => {
    if (!isPremium && task.isPinned) {
      updateTask(task.id, { isPinned: false });
      return;
    }

    if (!isPremium && !task.isPinned) {
      const pinnedTasks = tasks.filter(t => t.isPinned);
      if (pinnedTasks.length >= maxPinnedTasks) {
        Alert.alert(
          "Premium Feature",
          `You've reached your limit of ${maxPinnedTasks} pinned tasks. Upgrade to Premium to pin unlimited tasks!`,
          [{ text: "OK" }]
        );
        return;
      }
    }

    updateTask(task.id, { isPinned: !task.isPinned });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggleComplete}
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
        >
          {task.content}
        </Text>

        {task.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {!isPremium && task.isPinned && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.pinButton}
          onPress={handleTogglePin}
          disabled={!isPremium && !task.isPinned && tasks.filter(t => t.isPinned).length >= maxPinnedTasks}
        >
          <Text style={[
            styles.pinButtonText,
            task.isPinned && styles.pinnedButtonText
          ]}>
            {task.isPinned ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
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
  },
  completedText: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  dueDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: Colors.warningBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  premiumBadgeText: {
    color: Colors.warningText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  pinButton: {
    padding: 8,
    marginRight: 8,
  },
  pinButtonText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  pinnedButtonText: {
    color: Colors.warningButton,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: Colors.error,
  },
});

export default TaskItem;
