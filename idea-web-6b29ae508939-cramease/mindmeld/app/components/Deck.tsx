import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Card from './Card';
import { addReview } from '../utils/database';

interface DeckProps {
  cards: { id: number; front: string; back: string }[];
  onReviewComplete: () => void;
}

const Deck: React.FC<DeckProps> = ({ cards, onReviewComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [recallStrength, setRecallStrength] = useState<number | null>(null);

  useEffect(() => {
    if (recallStrength !== null) {
      const cardId = cards[currentIndex].id;
      addReview(cardId, recallStrength)
        .then(() => {
          setRecallStrength(null);
          onReviewComplete();
        })
        .catch(error => {
          Alert.alert('Error', 'Failed to save review');
          console.error(error);
        });
    }
  }, [recallStrength]);

  const handleNext = () => {
    if (recallStrength === null) {
      Alert.alert('Rate your recall', 'Please rate your recall strength before moving to the next card');
      return;
    }
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

  const handleRecallRating = (rating: number) => {
    // Convert rating (1-5) to recall strength (0-1)
    const strength = rating / 5;
    setRecallStrength(strength);
  };

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No cards in this deck</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
        <Text>Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleFlip}>
        <Card
          front={cards[currentIndex].front}
          back={cards[currentIndex].back}
          isFlipped={isFlipped}
        />
      </TouchableOpacity>
      <View style={styles.ratingContainer}>
        <Text>Rate your recall:</Text>
        {[1, 2, 3, 4, 5].map(rating => (
          <TouchableOpacity
            key={rating}
            onPress={() => handleRecallRating(rating)}
            style={[
              styles.ratingButton,
              recallStrength === rating / 5 && styles.selectedRating
            ]}
          >
            <Text>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    padding: 20,
  },
  navButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  ratingButton: {
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  selectedRating: {
    backgroundColor: '#aaf',
  },
});

export default Deck;
