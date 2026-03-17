import React from 'react';
import { View, Text, StyleSheet, Button, Share } from 'react-native';
import MoodSelector from './MoodSelector';
import { shouldShowMilestone } from '../lib/affirmations';
import { useStore } from '../store/useStore';

interface AffirmationCardProps {
  affirmation: {
    text: string;
  };
  streakCount: number;
}

const AffirmationCard: React.FC<AffirmationCardProps> = ({ affirmation, streakCount }) => {
  const isPremium = useStore((state) => state.isPremium);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My MotiMorph affirmation: "${affirmation.text}"`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.card}>
      {shouldShowMilestone(streakCount) && (
        <View style={styles.milestoneContainer}>
          <Text style={styles.milestoneText}>🎉 {streakCount} Day Milestone!</Text>
        </View>
      )}
      <Text style={styles.streak}>Streak: {streakCount} days</Text>
      <Text style={styles.affirmation}>{affirmation.text}</Text>
      <MoodSelector />
      <View style={styles.buttonContainer}>
        <Button title="Share" onPress={handleShare} />
        {!isPremium && (
          <Text style={styles.premiumHint}>Unlock more features with Premium</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneContainer: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  streak: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  affirmation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  premiumHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AffirmationCard;
