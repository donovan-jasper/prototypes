import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import InventoryCard from '../../components/InventoryCard';

const GameDetail = () => {
  const { id } = useLocalSearchParams();
  const { items, syncFromDB } = useInventoryStore();

  useEffect(() => {
    syncFromDB();
  }, []);

  const gameItems = items.filter(item => item.game === id);

  return (
    <View style={styles.container}>
      <FlatList
        data={gameItems}
        renderItem={({ item }) => <InventoryCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default GameDetail;
