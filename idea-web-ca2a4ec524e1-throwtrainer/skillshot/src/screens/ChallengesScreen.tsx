import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChallengeCard from '../components/ChallengeCard';
import { useChallengeStore } from '../store/useChallengeStore';

const ChallengesScreen = () => {
  const { availableChallenges } = useChallengeStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges</Text>
      {availableChallenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default ChallengesScreen;
