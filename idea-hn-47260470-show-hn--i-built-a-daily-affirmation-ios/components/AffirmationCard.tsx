import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MoodSelector from './MoodSelector';

interface AffirmationCardProps {
  affirmation: {
    text: string;
  };
  streakCount: number;
}

const AffirmationCard: React.FC<AffirmationCardProps> = ({ affirmation, streakCount }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.streak}>Streak: {streakCount} days</Text>
      <Text style={styles.affirmation}>{affirmation.text}</Text>
      <MoodSelector />
      <Button title="Share" onPress={() => {}} />
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
  streak: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  affirmation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AffirmationCard;
