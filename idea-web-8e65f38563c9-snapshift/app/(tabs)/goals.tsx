import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from '../../components/GoalCard';
import { SubscriptionContext } from '../../context/SubscriptionContext';

export default function GoalsScreen() {
  const { goals, addGoal } = useGoals();
  const { isPremium } = useContext(SubscriptionContext);

  const handleAddGoal = () => {
    if (!isPremium && goals.length >= 1) {
      // Show premium upgrade modal
      return;
    }
    addGoal();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#673ab7',
    padding: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
});
