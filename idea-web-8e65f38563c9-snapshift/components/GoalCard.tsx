import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../hooks/useGoals';
import { SubscriptionContext } from '../context/SubscriptionContext';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
  };
  index: number;
  onUpgradePress: () => void;
}

export default function GoalCard({ goal, index, onUpgradePress }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const { updateGoal, deleteGoal, toggleGoalCompletion } = useGoals();
  const { isFeatureUnlocked } = useContext(SubscriptionContext);

  const handleSave = () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Goal title cannot be empty');
      return;
    }
    updateGoal(goal.id, { title: title.trim() });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) }
      ]
    );
  };

  const handleToggleCompletion = () => {
    toggleGoalCompletion(goal.id);
  };

  const handleEditPress = () => {
    if (!isFeatureUnlocked('multipleGoals') && index >= 1) {
      onUpgradePress();
      return;
    }
    setIsEditing(true);
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
          onSubmitEditing={handleSave}
          returnKeyType="done"
        />
      ) : (
        <Text
          style={[styles.title, goal.completed && styles.completedTitle]}
          onPress={handleEditPress}
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
    paddingVertical: 4,
  },
});
