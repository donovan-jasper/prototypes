import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import StockCard from '../../components/StockCard';
import { searchStocks } from '../../lib/api';
import { useUserStore } from '../../store/useUserStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { searchesRemaining, decrementSearches } = useUserStore();
  const { addStock } = useWatchlistStore();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    if (searchesRemaining <= 0) {
      setError('You\'ve reached your daily search limit. Please upgrade to search more stocks.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      decrementSearches();
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (symbol: string, name: string, price: number) => {
    addStock({ symbol, name, price });
  };

  const handleStockPress = (symbol: string) => {
    navigation.navigate('Stock', { symbol });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search stocks (e.g. AAPL, Apple)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="characters"
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.searchLimitContainer}>
        <Text style={styles.searchLimitText}>
          Searches remaining today: {searchesRemaining}/5
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <StockCard
              symbol={item.symbol}
              name={item.name}
              price={item.price}
              change={item.change}
              onPress={() => handleStockPress(item.symbol)}
              onAddToWatchlist={() => handleAddToWatchlist(item.symbol, item.name, item.price)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : (
              <Text style={styles.emptyText}>Enter a stock symbol or company name to search</Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  searchLimitContainer: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchLimitText: {
    fontSize: 14,
    color: '#666',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});
