import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import { useStreak } from '../../hooks/useStreak';
import { useVoicePrompts } from '../../hooks/useVoicePrompts';
import GoalCard from '../../components/GoalCard';
import StreakBadge from '../../components/StreakBadge';
import MoodSelector from '../../components/MoodSelector';
import VoicePlayer from '../../components/VoicePlayer';
import { SubscriptionContext } from '../../context/SubscriptionContext';

export default function HomeScreen() {
  const { goals } = useGoals();
  const { currentStreak, recordCheckIn } = useStreak();
  const { scheduledPrompts, playPrompt } = useVoicePrompts();
  const { isPremium } = useContext(SubscriptionContext);

  useEffect(() => {
    recordCheckIn();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <StreakBadge streak={currentStreak} />
      </View>
      <MoodSelector />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Prompts</Text>
        {scheduledPrompts.map((prompt) => (
          <VoicePlayer
            key={prompt.id}
            clip={prompt.clip}
            onPlay={() => playPrompt(prompt.id)}
          />
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
