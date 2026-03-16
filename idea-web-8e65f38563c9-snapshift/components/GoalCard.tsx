import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../hooks/useGoals';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
  };
}

export default function GoalCard({ goal }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const { updateGoal, deleteGoal, toggleGoalCompletion } = useGoals();

  const handleSave = () => {
    updateGoal(goal.id, { title });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteGoal(goal.id);
  };

  const handleToggleCompletion = () => {
    toggleGoalCompletion(goal.id);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleToggleCompletion}>
        <Ionicons
          name={goal.completed ? 'checkbox' : 'square-outline'}
          size={24}
          color={goal.completed ? '#673ab7' : '#9e9e9e'}
        />
      </TouchableOpacity>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <Text
          style={[styles.title, goal.completed && styles.completedTitle]}
          onPress={() => setIsEditing(true)}
        >
          {goal.title}
        </Text>
      )}
      <TouchableOpacity onPress={handleDelete}>
        <Ionicons name="trash-outline" size={24} color="#e53935" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#673ab7',
  },
});
