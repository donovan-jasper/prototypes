import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useStore } from '../../lib/store';

const TUTORIALS = [
  {
    id: 'catapult',
    title: 'Build a Catapult',
    description: 'Launch a ball using levers and pulleys',
    difficulty: 'Medium',
    thumbnail: 'catapult-thumb',
  },
  {
    id: 'marble-run',
    title: 'Make a Marble Run',
    description: 'Guide a marble through a complex track',
    difficulty: 'Hard',
    thumbnail: 'marble-run-thumb',
  },
  // Add more tutorials
];

export default function TutorialsScreen() {
  const router = useRouter();
  const { setSelectedTutorial } = useStore();

  const handleStartTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={TUTORIALS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => handleStartTutorial(item)}>
            <Card.Cover source={{ uri: item.thumbnail }} />
            <Card.Content>
              <Title>{item.title}</Title>
              <Paragraph>{item.description}</Paragraph>
              <Paragraph>Difficulty: {item.difficulty}</Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
