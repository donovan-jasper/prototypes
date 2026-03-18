import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { listDecks, type Deck } from '../../lib/db/queries';
import DeckCard from '../../components/DeckCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function HomeScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDecks = useCallback(async () => {
    try {
      const data = await listDecks();
      setDecks(data);
      setFilteredDecks(data);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDecks(decks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredDecks(
        decks.filter(deck => 
          deck.title.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, decks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDecks();
  }, [loadDecks]);

  const handleDeckPress = useCallback((deckId: number) => {
    router.push(`/deck/${deckId}`);
  }, [router]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No decks yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Tap the Create tab to generate your first slide deck
      </Text>
    </View>
  );

  const renderDeck = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      onPress={() => handleDeckPress(item.id!)}
      activeOpacity={0.7}
    >
      <DeckCard
        title={item.title}
        slideCount={item.slideCount}
        createdAt={item.createdAt}
        thumbnail={item.thumbnail}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          My Decks
        </Text>
        {decks.length > 0 && (
          <Searchbar
            placeholder="Search decks"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        )}
      </Surface>
      
      <FlatList
        data={filteredDecks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={[
          styles.listContent,
          filteredDecks.length === 0 && styles.listContentEmpty
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
});
