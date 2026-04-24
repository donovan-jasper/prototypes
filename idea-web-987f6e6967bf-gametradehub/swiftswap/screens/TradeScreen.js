import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { calculateTradeProfit } from '../utils/trade';

const TradeScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState({});

  useEffect(() => {
    const inventoryRef = ref(database, 'inventory');
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setInventory(items);
      setLoading(false);

      // Fetch market prices for each item
      items.forEach(item => {
        fetchMarketPrice(item.barcode);
      });
    });
  }, []);

  const fetchMarketPrice = async (barcode) => {
    try {
      // In a real app, this would call the IGDB API
      // For demo purposes, we'll use mock data
      const mockPrices = {
        '123456789012': 59.99,
        '987654321098': 39.99,
        '555555555555': 29.99
      };

      setMarketPrices(prev => ({
        ...prev,
        [barcode]: mockPrices[barcode] || 0
      }));
    } catch (error) {
      console.error('Error fetching market price:', error);
    }
  };

  const executeTrade = (item) => {
    const currentPrice = marketPrices[item.barcode] || 0;
    const profit = calculateTradeProfit(item.purchasePrice, currentPrice);

    // Update trade status in Firebase
    const tradeRef = ref(database, `trades/${item.id}`);
    update(tradeRef, {
      status: 'completed',
      sellPrice: currentPrice,
      profit: profit,
      timestamp: Date.now()
    });

    alert(`Trade executed! Profit: $${profit.toFixed(2)}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title || 'Unknown Game'}</Text>
      <Text>Barcode: {item.barcode}</Text>
      <Text>Purchase Price: ${item.purchasePrice?.toFixed(2) || '0.00'}</Text>
      <Text>Market Price: ${marketPrices[item.barcode]?.toFixed(2) || 'Loading...'}</Text>
      <TouchableOpacity
        style={styles.tradeButton}
        onPress={() => executeTrade(item)}
      >
        <Text style={styles.tradeButtonText}>Execute Trade</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Inventory</Text>
      {inventory.length === 0 ? (
        <Text style={styles.emptyText}>No items in your inventory. Add some first!</Text>
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Button
        title="Add More Items"
        onPress={() => navigation.navigate('Inventory')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tradeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    marginTop: 12,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TradeScreen;
