import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';

interface DeckProps {
  cards: { front: string; back: string }[];
}

const Deck: React.FC<DeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
        <Text>Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleFlip}>
        <Card front={cards[currentIndex].front} back={cards[currentIndex].back} isFlipped={isFlipped} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNext} style={styles.navButton}>
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default Deck;
