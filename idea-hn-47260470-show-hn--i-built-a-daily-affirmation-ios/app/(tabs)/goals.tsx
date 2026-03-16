import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import GoalItem from '../../components/GoalItem';
import { getGoals, addGoal } from '../../lib/database';

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const data = await getGoals();
    setGoals(data);
  };

  const handleAddGoal = async () => {
    const newGoal = await addGoal('New Goal');
    setGoals([...goals, newGoal]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Goals</Text>
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} />
      ))}
      <Button title="Add Goal" onPress={handleAddGoal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default GoalsScreen;
