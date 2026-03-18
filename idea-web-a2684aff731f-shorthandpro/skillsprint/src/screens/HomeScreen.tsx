import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ChallengeCard from '../components/ChallengeCard';
import { RootTabParamList } from '../types/navigation';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

const challenges = [
  { id: '1', title: 'Typing Challenge', description: 'Improve your typing speed and accuracy' },
  { id: '2', title: 'Memory Challenge', description: 'Test and improve your memory skills' },
  { id: '3', title: 'Math Challenge', description: 'Solve quick math problems to boost your brain' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleChallengePress = (challenge: typeof challenges[0]) => {
    navigation.navigate('Challenge', {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SkillSprint</Text>
      <Text style={styles.subtitle}>Choose a challenge to get started</Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChallengeCard
            title={item.title}
            description={item.description}
            onPress={() => handleChallengePress(item)}
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
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
});

export default HomeScreen;
