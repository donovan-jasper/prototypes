import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SkillTree from '../components/SkillTree';
import ChallengeCard from '../components/ChallengeCard';

const Home: React.FC = () => {
  const skills = [
    { id: '1', name: 'Beginner', x: 50, y: 50, unlocked: true },
    { id: '2', name: 'Intermediate', x: 150, y: 150, unlocked: false },
    { id: '3', name: 'Advanced', x: 250, y: 50, unlocked: false },
  ];

  const connections = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
  ];

  const handleCompleteChallenge = () => {
    // Handle challenge completion logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillHive</Text>
      <View style={styles.skillTreeContainer}>
        <SkillTree skills={skills} connections={connections} />
      </View>
      <View style={styles.challengesContainer}>
        <ChallengeCard
          title="Daily Challenge"
          description="Complete 3 tasks today"
          xpReward={30}
          onComplete={handleCompleteChallenge}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  skillTreeContainer: {
    flex: 1,
    marginBottom: 20,
  },
  challengesContainer: {
    flex: 1,
  },
});

export default Home;
