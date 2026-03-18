import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.game}>{item.game}</Text>
      <Text style={styles.value}>${item.value}</Text>
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
    minHeight: 100,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  game: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#03A9F4',
  },
});

export default InventoryCard;
