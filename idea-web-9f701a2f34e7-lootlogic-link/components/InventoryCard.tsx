import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
}

interface InventoryCardProps {
  item: Item;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Text>{item.name}</Text>
      <Text>{item.game}</Text>
      <Text>{item.value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default InventoryCard;
