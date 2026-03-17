import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  onPress: () => void;
  onAddToWatchlist: () => void;
}

export default function StockCard({ symbol, name, price, change, onPress, onAddToWatchlist }: StockCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? '#4CAF50' : '#F44336';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>{name}</Text>

      <View style={styles.footer}>
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            onAddToWatchlist();
          }}
        >
          <Text style={styles.addButtonText}>Add to Watchlist</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
