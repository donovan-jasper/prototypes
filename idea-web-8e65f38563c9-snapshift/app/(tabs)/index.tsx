import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import { useStreak } from '../../hooks/useStreak';
import { useVoicePrompts } from '../../hooks/useVoicePrompts';
import GoalCard from '../../components/GoalCard';
import StreakBadge from '../../components/StreakBadge';
import MoodSelector from '../../components/MoodSelector';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { PremiumGate } from '../../components/PremiumGate';

export default function HomeScreen() {
  const { goals, addGoal } = useGoals();
  const { currentStreak, recordCheckIn } = useStreak();
  const { promptsToday, promptLimitReached, playRandomPrompt } = useVoicePrompts();
  const { isFeatureUnlocked } = useContext(SubscriptionContext);

  useEffect(() => {
    recordCheckIn();
  }, []);

  const handlePlayNow = () => {
    if (promptLimitReached && !isFeatureUnlocked('unlimitedPrompts')) {
      // Show premium upgrade modal
      return;
    }
    playRandomPrompt();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Motivation</Text>
        <StreakBadge streak={currentStreak} />
      </View>

      <MoodSelector />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <TouchableOpacity onPress={() => addGoal('New Goal')}>
            <Text style={styles.addButton}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} index={0} onUpgradePress={() => {}} />
          ))
        ) : (
          <Text style={styles.emptyText}>Add your first goal to get started!</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Motivation</Text>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayNow}>
          <Text style={styles.playButtonText}>Play Now</Text>
        </TouchableOpacity>

        <PremiumGate
          feature="unlimitedPrompts"
          renderLocked={() => (
            <View style={styles.promptLimit}>
              <Text style={styles.promptLimitText}>
                You've used {promptsToday} of your 3 daily prompts. Upgrade for unlimited!
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </View>
          )}
        >
          <View style={styles.promptLimit}>
            <Text style={styles.promptLimitText}>
              You've used {promptsToday} of your {isFeatureUnlocked('unlimitedPrompts') ? 'unlimited' : '3'} daily prompts.
            </Text>
          </View>
        </PremiumGate>
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
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    color: '#673ab7',
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  playButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promptLimit: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  promptLimitText: {
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
