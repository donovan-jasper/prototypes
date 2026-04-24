import React from 'react';
import { View, StyleSheet } from 'react-native';
import Deck from '../components/Deck';

const FlashcardScreen: React.FC = () => {
  const cards = [
    { front: 'What is the capital of France?', back: 'Paris' },
    { front: 'What is 2 + 2?', back: '4' },
    // Add more cards here
  ];

  return (
    <View style={styles.container}>
      <Deck cards={cards} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FlashcardScreen;
