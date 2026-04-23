import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import StockCard from '../../components/StockCard';
import { searchStocks } from '../../lib/api';
import { useUserStore } from '../../store/useUserStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { debounce } from 'lodash';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { searchesRemaining, decrementSearches, isPremium } = useUserStore();
  const { addStock, stocks } = useWatchlistStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      if (!isPremium && searchesRemaining <= 0) {
        setError('You\'ve reached your daily search limit. Upgrade to search more stocks.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await searchStocks(query);
        setSearchResults(results);
        if (!isPremium) {
          decrementSearches();
        }
      } catch (err) {
        setError('Failed to fetch search results. Please check your connection and try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [searchesRemaining, isPremium]
  );

  // Effect for search
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleAddToWatchlist = (symbol: string, name: string, price: number) => {
    if (stocks.some(stock => stock.symbol === symbol)) {
      Alert.alert('Already in Watchlist', `${symbol} is already in your watchlist.`);
      return;
    }

    addStock({ symbol, name, price });
    Alert.alert('Added to Watchlist', `${symbol} has been added to your watchlist.`);
  };

  const handleStockPress = (symbol: string) => {
    navigation.navigate('Stock', { symbol });
  };

  const handleUpgradePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search stocks (e.g. AAPL, Apple)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {!isPremium && (
        <View style={styles.searchLimitContainer}>
          <Text style={styles.searchLimitText}>
            Searches remaining today: {searchesRemaining}/5
          </Text>
          {searchesRemaining <= 0 && (
            <TouchableOpacity onPress={handleUpgradePress}>
              <Text style={styles.upgradeText}>Upgrade for unlimited searches</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {!isPremium && searchesRemaining <= 0 && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loadingIndicator} color="#4CAF50" />
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                <Text style={styles.emptySubtext}>Try searching for a different stock or company name</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Search for stocks</Text>
                <Text style={styles.emptySubtext}>Enter a stock symbol or company name to begin</Text>
              </View>
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
  searchLimitContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchLimitText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
