import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { calculateTradeProfit, formatCurrency } from '../utils/trade';

const TradeScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const inventoryRef = ref(database, 'inventory');
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setInventory(items);
      setLoading(false);

      // Fetch market prices for each item
      items.forEach(item => {
        fetchMarketPrice(item.id, item.title);
      });
    });

    return () => unsubscribe();
  }, []);

  const fetchMarketPrice = async (itemId, gameTitle) => {
    try {
      // In a real app, this would call the IGDB API
      // For now, we'll use mock data with some randomness
      const mockPrices = {
        'The Legend of Zelda: Breath of the Wild': 59.99,
        'Super Mario Odyssey': 39.99,
        'Elden Ring': 29.99,
        'Minecraft': 24.99,
        'Red Dead Redemption 2': 49.99
      };

      // Add some random variation to simulate real market data
      const basePrice = mockPrices[gameTitle] || 19.99;
      const variation = (Math.random() * 10 - 5); // -5% to +5% variation
      const currentPrice = basePrice * (1 + variation / 100);

      setMarketPrices(prev => ({
        ...prev,
        [itemId]: currentPrice.toFixed(2)
      }));
    } catch (error) {
      console.error('Error fetching market price:', error);
      setMarketPrices(prev => ({
        ...prev,
        [itemId]: 'N/A'
      }));
    }
  };

  const refreshPrices = () => {
    setRefreshing(true);
    inventory.forEach(item => {
      fetchMarketPrice(item.id, item.title);
    });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const executeTrade = (item) => {
    const currentPrice = parseFloat(marketPrices[item.id]);
    const buyPrice = item.purchasePrice || 0;
    const profit = calculateTradeProfit(buyPrice, currentPrice);

    if (isNaN(currentPrice) || currentPrice <= 0) {
      Alert.alert('Error', 'Market price not available for this item');
      return;
    }

    // Update trade status in Firebase
    const tradeRef = ref(database, `trades/${item.id}`);
    update(tradeRef, {
      status: 'completed',
      sellPrice: currentPrice,
      profit: profit,
      timestamp: Date.now()
    });

    Alert.alert(
      'Trade Executed',
      `Sold ${item.title} for ${formatCurrency(currentPrice)}\nProfit: ${formatCurrency(profit)}`
    );
  };

  const renderItem = ({ item }) => {
    const currentPrice = marketPrices[item.id];
    const buyPrice = item.purchasePrice || 0;
    const profit = calculateTradeProfit(buyPrice, parseFloat(currentPrice));

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.title || 'Unknown Game'}</Text>
        {item.barcode && <Text style={styles.barcodeText}>Barcode: {item.barcode}</Text>}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Purchase Price:</Text>
          <Text style={styles.priceValue}>{formatCurrency(buyPrice)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Market Price:</Text>
          <Text style={styles.priceValue}>
            {currentPrice ? formatCurrency(parseFloat(currentPrice)) : 'Loading...'}
          </Text>
        </View>
        {currentPrice && !isNaN(parseFloat(currentPrice)) && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Potential Profit:</Text>
            <Text style={[styles.priceValue, { color: profit > 0 ? 'green' : 'red' }]}>
              {formatCurrency(profit)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.tradeButton,
            { backgroundColor: currentPrice && !isNaN(parseFloat(currentPrice)) ? '#4CAF50' : '#CCCCCC' }
          ]}
          onPress={() => executeTrade(item)}
          disabled={!currentPrice || isNaN(parseFloat(currentPrice))}
        >
          <Text style={styles.tradeButtonText}>Execute Trade</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Inventory</Text>
        <Button
          title="Refresh Prices"
          onPress={refreshPrices}
          disabled={refreshing}
        />
      </View>
      {inventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in your inventory. Add some first!</Text>
          <Button
            title="Add Items"
            onPress={() => navigation.navigate('Inventory')}
          />
        </View>
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={refreshPrices}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
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
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
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
  barcodeText: {
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tradeButton: {
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
