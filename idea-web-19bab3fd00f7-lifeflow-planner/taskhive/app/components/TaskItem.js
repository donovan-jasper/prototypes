import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskItem = ({ task, onLongPress }) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getPriorityColor() }]} onTouchStart={onLongPress}>
      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        {task.notes ? <Text style={styles.notes}>{task.notes}</Text> : null}
        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.priorityText}>{task.priority || 'medium'}</Text>
          </View>
          {task.category && <Text style={styles.category}>{task.category}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  category: {
    fontSize: 12,
    color: '#999',
  },
});

export default TaskItem;
