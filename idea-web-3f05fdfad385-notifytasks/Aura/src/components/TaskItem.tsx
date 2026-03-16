import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/TaskTypes';
import { Colors } from '../constants/Colors';

interface TaskItemProps {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onComplete(task.id)}>
        <View style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}>
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <Text style={[styles.content, task.isCompleted && styles.contentCompleted]}>{task.content}</Text>
      <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Text style={styles.deleteButton}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    fontSize: 16,
  },
  contentCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.lightGray,
  },
  deleteButton: {
    fontSize: 20,
    color: Colors.error,
  },
});

export default TaskItem;
