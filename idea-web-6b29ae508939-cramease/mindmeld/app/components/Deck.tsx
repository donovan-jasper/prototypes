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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (recallStrength !== null && !isProcessing) {
      const cardId = cards[currentIndex].id;
      setIsProcessing(true);
      addReview(cardId, recallStrength)
        .then(() => {
          setRecallStrength(null);
          setIsProcessing(false);
          onReviewComplete();
        })
        .catch(error => {
          Alert.alert('Error', 'Failed to save review');
          console.error(error);
          setIsProcessing(false);
        });
    }
  }, [recallStrength, isProcessing]);

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
        <Text style={styles.emptyText}>No cards in this deck</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {cards.length}
        </Text>
      </View>

      <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
        <Text style={styles.navButtonText}>Previous</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFlip} style={styles.cardContainer}>
        <Card
          front={cards[currentIndex].front}
          back={cards[currentIndex].back}
          isFlipped={isFlipped}
        />
      </TouchableOpacity>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rate your recall:</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map(rating => (
            <TouchableOpacity
              key={rating}
              onPress={() => handleRecallRating(rating)}
              style={[
                styles.ratingButton,
                recallStrength === rating / 5 && styles.selectedRating
              ]}
              disabled={isProcessing}
            >
              <Text style={styles.ratingButtonText}>{rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleNext}
        style={[styles.navButton, isProcessing && styles.disabledButton]}
        disabled={isProcessing}
      >
        <Text style={styles.navButtonText}>Next</Text>
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
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    marginVertical: 20,
  },
  navButton: {
    margin: 10,
    padding: 15,
    backgroundColor: '#4a6baf',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  ratingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingButton: {
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    width: 40,
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#4a6baf',
  },
  ratingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default Deck;
