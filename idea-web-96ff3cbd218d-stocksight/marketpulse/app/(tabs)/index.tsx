import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useUserStore } from '../../store/userStore';
import { fetchStockPrice } from '../../services/stocks';
import StockCard from '../../components/StockCard';
import PremiumBanner from '../../components/PremiumBanner';
import { FREE_TIER_LIMIT } from '../../constants/config';

const WatchlistScreen = () => {
  const { stocks, loadFromDB, updateStockPrice, addStock } = useWatchlistStore();
  const { isPremium } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);

  useEffect(() => {
    loadFromDB();
    fetchAllPrices();
  }, []);

  const fetchAllPrices = async () => {
    for (const stock of stocks) {
      try {
        const data = await fetchStockPrice(stock.symbol);
        if (data) {
          updateStockPrice(stock.symbol, data.price, data.change);
        }
      } catch (error) {
        console.error(`Error fetching price for ${stock.symbol}:`, error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllPrices();
    setRefreshing(false);
  };

  const handleAddStock = () => {
    if (!isPremium && stocks.length >= FREE_TIER_LIMIT) {
      setShowPremiumBanner(true);
      return;
    }
    setModalVisible(true);
  };

  const handleSubmitSymbol = async () => {
    const symbol = searchSymbol.trim().toUpperCase();
    if (!symbol) {
      Alert.alert('Error', 'Please enter a stock symbol');
      return;
    }

    if (stocks.some(stock => stock.symbol === symbol)) {
      Alert.alert('Error', 'Stock already in watchlist');
      return;
    }

    try {
      const data = await fetchStockPrice(symbol);
      if (data) {
        addStock(symbol);
        updateStockPrice(symbol, data.price, data.change);
        setModalVisible(false);
        setSearchSymbol('');
      } else {
        Alert.alert('Error', 'Could not fetch stock data. Please check the symbol.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock. Please try again.');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trending-up" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Add your first stock</Text>
      <Text style={styles.emptySubtitle}>
        Start building your watchlist to track market movements
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddStock}>
        <Text style={styles.emptyButtonText}>Add Stock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {showPremiumBanner && (
        <PremiumBanner />
      )}
      
      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => <StockCard stock={item} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={stocks.length === 0 ? styles.emptyList : styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddStock}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stock</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={searchSymbol}
              onChangeText={setSearchSymbol}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
            />
            
            <TouchableOpacity style={styles.addButton} onPress={handleSubmitSymbol}>
              <Text style={styles.addButtonText}>Add to Watchlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 250,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WatchlistScreen;
