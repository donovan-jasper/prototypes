import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getDueCards, updateCardRecallStrength } from '../utils/spacedRepetition';

interface Card {
  id: number;
  front: string;
  back: string;
  recallStrength: number;
}

const FlashcardScreen = ({ route }) => {
  const { deckId } = route.params;
  const db = useSQLiteContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const dueCards = await getDueCards(db, deckId);
        setCards(dueCards);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cards:', error);
        setIsLoading(false);
      }
    };

    loadCards();
  }, [deckId]);

  const handleRecallStrength = async (isEasy: boolean) => {
    if (!cards[currentCardIndex]) return;

    try {
      await updateCardRecallStrength(db, cards[currentCardIndex].id, isEasy);
      setShowBack(false);

      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // All cards reviewed
        const updatedCards = await getDueCards(db, deckId);
        if (updatedCards.length > 0) {
          setCards(updatedCards);
          setCurrentCardIndex(0);
        } else {
          // No more cards due
          setCards([]);
        }
      }
    } catch (error) {
      console.error('Error updating recall strength:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCardsText}>No cards due for review today!</Text>
        <Text style={styles.subText}>Great job! Come back tomorrow for more.</Text>
      </View>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentCardIndex + 1} of {cards.length}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => setShowBack(!showBack)}
        activeOpacity={0.9}
      >
        <Text style={styles.cardText}>
          {showBack ? currentCard.back : currentCard.front}
        </Text>
      </TouchableOpacity>

      {showBack && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.hardButton]}
            onPress={() => handleRecallStrength(false)}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.easyButton]}
            onPress={() => handleRecallStrength(true)}
          >
            <Text style={styles.buttonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#ff6b6b',
  },
  easyButton: {
    backgroundColor: '#4ecdc4',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noCardsText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default FlashcardScreen;
