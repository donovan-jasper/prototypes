import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TaskItemProps = {
  title: string;
  completed: boolean;
  onPress: () => void;
};

export default function TaskItem({ title, completed, onPress }: TaskItemProps) {
  return (
    <TouchableOpacity style={[styles.container, completed && styles.completedContainer]} onPress={onPress}>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.completedTitle]}>
          {title}
        </Text>
        <View style={[styles.checkbox, completed && styles.checkedBox]}>
          {completed && <Text style={styles.checkmark}>âœ“</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#e8f4f3',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4ecdc4',
    borderColor: '#4ecdc4',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
