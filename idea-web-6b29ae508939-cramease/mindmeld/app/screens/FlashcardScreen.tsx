import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Deck from '../components/Deck';
import { initializeDatabase, getDueCards } from '../utils/database';

const FlashcardScreen: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      setIsLoading(true);
      const dueCards = await getDueCards();
      setCards(dueCards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading your cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cards.length > 0 ? (
        <Deck cards={cards} onReviewComplete={loadDueCards} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>No cards due for review today!</Text>
          <Text>Great job! You've mastered all your cards.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default FlashcardScreen;
