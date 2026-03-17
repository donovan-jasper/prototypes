import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import { useStreak } from '../../hooks/useStreak';
import { useVoicePrompts } from '../../hooks/useVoicePrompts';
import GoalCard from '../../components/GoalCard';
import StreakBadge from '../../components/StreakBadge';
import MoodSelector from '../../components/MoodSelector';
import VoicePlayer from '../../components/VoicePlayer';
import { SubscriptionContext } from '../../context/SubscriptionContext';
import { useAudio } from '../../hooks/useAudio';

export default function HomeScreen() {
  const { goals } = useGoals();
  const { currentStreak, recordCheckIn } = useStreak();
  const { scheduledPrompts } = useVoicePrompts();
  const { isPremium } = useContext(SubscriptionContext);
  const { playAudio, stopAudio, isLoading, error } = useAudio();
  const [currentClip, setCurrentClip] = useState<string | null>(null);

  useEffect(() => {
    recordCheckIn();
  }, []);

  const handlePlayClip = async (clipId: string) => {
    try {
      if (currentClip === clipId) {
        await stopAudio();
        setCurrentClip(null);
      } else {
        await stopAudio();
        const clip = scheduledPrompts.find(p => p.clip.id === clipId)?.clip;
        if (clip) {
          await playAudio(clip.audioFile);
          setCurrentClip(clipId);
        }
      }
    } catch (err) {
      console.error('Error playing clip:', err);
    }
  };

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
            onPlay={() => handlePlayClip(prompt.clip.id)}
            isLocked={prompt.clip.isPremium && !isPremium}
          />
        ))}
        {isLoading && <Text style={styles.loadingText}>Loading audio...</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      {currentClip && (
        <TouchableOpacity style={styles.stopAllButton} onPress={stopAudio}>
          <Text style={styles.stopAllButtonText}>Stop All</Text>
        </TouchableOpacity>
      )}
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
  loadingText: {
    textAlign: 'center',
    color: '#673ab7',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#e53935',
    marginTop: 8,
  },
  stopAllButton: {
    backgroundColor: '#673ab7',
    padding: 12,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  stopAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
