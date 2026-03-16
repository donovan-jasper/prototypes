import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ChallengeCard from '../components/ChallengeCard';

const challenges = [
  { id: '1', title: 'Typing Challenge', description: 'Improve your typing speed and accuracy' },
  { id: '2', title: 'Memory Challenge', description: 'Test and improve your memory skills' },
  { id: '3', title: 'Math Challenge', description: 'Solve quick math problems to boost your brain' },
];

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SkillSprint</Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard
            title={item.title}
            description={item.description}
            onPress={() => console.log('Challenge selected:', item.title)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default HomeScreen;
