import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChallengeStore } from '../store/useChallengeStore';

const ChallengeCard = ({ challenge }) => {
  const navigation = useNavigation();
  const { startChallenge } = useChallengeStore();

  const handleStartChallenge = () => {
    startChallenge(challenge.id);
    navigation.navigate('ARTraining');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{challenge.name}</Text>
      <Text style={styles.description}>{challenge.description}</Text>
      <Button title="Start Challenge" onPress={handleStartChallenge} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
});

export default ChallengeCard;
