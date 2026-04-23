import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFeedStore } from '../../store/feedStore';
import { useWatchlistStore } from '../../store/watchlistStore';
import NewsCard from '../../components/NewsCard';
import SentimentFilter from '../../components/SentimentFilter';
import { NewsArticle } from '../../types/news';

const FeedScreen = () => {
  const {
    articles,
    filteredArticles,
    isLoading,
    error,
    fetchFeed,
    dismissArticle,
    filterSentiment,
    currentSentimentFilter,
  } = useFeedStore();
  const { stocks } = useWatchlistStore();

  useEffect(() => {
    if (stocks.length > 0) {
      fetchFeed(stocks.map(stock => stock.symbol));
    }
  }, [stocks]);

  const handleDismiss = useCallback((id: string) => {
    dismissArticle(id);
  }, [dismissArticle]);

  const handleFilterChange = useCallback((filter: 'all' | 'bullish' | 'bearish' | 'neutral') => {
    filterSentiment(filter);
  }, [filterSentiment]);

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <NewsCard
      article={item}
      onDismiss={() => handleDismiss(item.id)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchFeed(stocks.map(stock => stock.symbol))}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredArticles.length === 0 && stocks.length > 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No news articles found for your watchlist</Text>
      </View>
    );
  }

  if (stocks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Add stocks to your watchlist to see news</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SentimentFilter
        currentFilter={currentSentimentFilter}
        onFilterChange={handleFilterChange}
      />
      <FlatList
        data={filteredArticles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default FeedScreen;
