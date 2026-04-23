import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import InventoryCard from '../../components/InventoryCard';

const GameDetail = () => {
  const { id } = useLocalSearchParams();
  const { items, syncFromDB, refreshItemPrice } = useInventoryStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    syncFromDB();
  }, []);

  const gameItems = items.filter(item => item.game === id);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all items in this game
      for (const item of gameItems) {
        await refreshItemPrice(item.id);
      }
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Text>No game selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={gameItems}
        renderItem={({ item }) => <InventoryCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#03A9F4']}
            tintColor="#03A9F4"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No items found for this game</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  errorContainer: {
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

export default GameDetail;
