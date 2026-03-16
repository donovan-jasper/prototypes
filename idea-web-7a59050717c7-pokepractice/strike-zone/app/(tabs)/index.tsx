import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChallengeCard from '../../components/ChallengeCard';
import StreakCounter from '../../components/StreakCounter';
import { useStore } from '../../store/useStore';

const HomeScreen = () => {
  const { userStats } = useStore();

  return (
    <View style={styles.container}>
      <StreakCounter streak={userStats.streak} />
      <ChallengeCard
        title="Tap Timing"
        description="Test your precision with this quick tap challenge"
        bestScore={userStats.bestScores['tap-timing']}
        onPress={() => console.log('Start Tap Timing Challenge')}
      />
      <ChallengeCard
        title="Reaction Speed"
        description="How fast can you react to the screen?"
        bestScore={userStats.bestScores['reaction-speed']}
        onPress={() => console.log('Start Reaction Speed Challenge')}
      />
      <ChallengeCard
        title="Motion Tracking"
        description="Track your movements with the device sensors"
        bestScore={userStats.bestScores['motion-tracking']}
        premium
        onPress={() => console.log('Start Motion Tracking Challenge')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
