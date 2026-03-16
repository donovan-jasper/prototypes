import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useFeedStore } from '../../store/feedStore';
import NewsCard from '../../components/NewsCard';

const FeedScreen = () => {
  const { articles, fetchFeed } = useFeedStore();

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewsCard article={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No news available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default FeedScreen;
