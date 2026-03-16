import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useWatchlistStore } from '../../store/watchlistStore';
import StockCard from '../../components/StockCard';

const WatchlistScreen = () => {
  const { stocks, loadFromDB } = useWatchlistStore();

  useEffect(() => {
    loadFromDB();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => <StockCard stock={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Add your first stock</Text>}
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

export default WatchlistScreen;
