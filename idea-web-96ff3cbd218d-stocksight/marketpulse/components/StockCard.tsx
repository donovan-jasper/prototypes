import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface StockCardProps {
  stock: {
    symbol: string;
    price: number;
    change: number;
  };
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const router = useRouter();
  const changeColor = stock.change >= 0 ? 'green' : 'red';

  return (
    <TouchableOpacity onPress={() => router.push(`/stock/${stock.symbol}`)}>
      <View style={styles.card}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.price}>${stock.price.toFixed(2)}</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
  },
  change: {
    fontSize: 16,
  },
});

export default StockCard;
