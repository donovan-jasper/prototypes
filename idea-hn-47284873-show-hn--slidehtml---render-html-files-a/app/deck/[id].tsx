import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { getDeck, type Deck } from '../../lib/db/queries';
import SlideViewer from '../../components/SlideViewer';

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const loadDeck = async () => {
      try {
        const deckData = await getDeck(parseInt(id, 10));
        setDeck(deckData);
      } catch (error) {
        console.error('Failed to load deck:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleMedium">Deck not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SlideViewer html={deck.html} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
