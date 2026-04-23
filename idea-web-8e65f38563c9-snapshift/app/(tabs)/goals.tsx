import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from '../../components/GoalCard';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { PremiumGate } from '../../components/PremiumGate';

export default function GoalsScreen() {
  const { goals, addGoal } = useGoals();
  const { isFeatureUnlocked } = useContext(SubscriptionContext);

  const handleAddGoal = () => {
    if (!isFeatureUnlocked('multipleGoals') && goals.length >= 1) {
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

      <PremiumGate
        feature="multipleGoals"
        renderLocked={() => (
          <View style={styles.premiumNotice}>
            <Text style={styles.premiumNoticeText}>
              Free users can only create 1 goal. Upgrade to create up to 5 goals!
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <View style={styles.premiumNotice}>
          <Text style={styles.premiumNoticeText}>
            You're using {goals.length} of your {isFeatureUnlocked('multipleGoals') ? '5' : '1'} available goals.
          </Text>
        </View>
      </PremiumGate>
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
  premiumNotice: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  premiumNoticeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
