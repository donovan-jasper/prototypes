import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Keyboard, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useUserStore } from '../../store/userStore';
import StockCard from '../../components/StockCard';
import PremiumBanner from '../../components/PremiumBanner';
import { fetchStockPrice, getCachedStockPrice } from '../../services/stocks';

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

const WatchlistScreen = () => {
  const { stocks, loadFromDB, addStock, updateStockPrice } = useWatchlistStore();
  const { isPremium } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFromDB();
    fetchAllPrices();
  }, []);

  const fetchAllPrices = async () => {
    setLoading(true);
    setErrors({});
    
    const pricePromises = stocks.map(async (stock) => {
      try {
        const cachedPrice = await getCachedStockPrice(stock.symbol);
        if (cachedPrice !== null) {
          updateStockPrice(stock.symbol, cachedPrice as number, 0);
          return;
        }

        const priceData = await fetchStockPrice(stock.symbol);
        if (priceData && priceData.price !== undefined) {
          const change = priceData.change || 0;
          updateStockPrice(stock.symbol, priceData.price, change);
        }
      } catch (error) {
        console.error(`Error fetching price for ${stock.symbol}:`, error);
        setErrors(prev => ({
          ...prev,
          [stock.symbol]: 'Failed to fetch price'
        }));
      }
    });

    await Promise.all(pricePromises);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllPrices();
    setRefreshing(false);
  };

  const filteredStocks = POPULAR_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStock = (symbol: string) => {
    if (stocks.length >= 5 && !isPremium) {
      setShowPremiumBanner(true);
      setModalVisible(false);
      setSearchQuery('');
      return;
    }

    addStock(symbol);
    setModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
    
    fetchStockPrice(symbol)
      .then((priceData) => {
        if (priceData && priceData.price !== undefined) {
          const change = priceData.change || 0;
          updateStockPrice(symbol, priceData.price, change);
        }
      })
      .catch((error) => {
        console.error(`Error fetching price for ${symbol}:`, error);
        setErrors(prev => ({
          ...prev,
          [symbol]: 'Failed to fetch price'
        }));
      });
  };

  const renderStockCard = ({ item }: { item: any }) => {
    const hasError = errors[item.symbol];
    
    if (loading && item.price === 0) {
      return (
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonSymbol} />
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonChange} />
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorSymbol}>{item.symbol}</Text>
          <Text style={styles.errorText}>{hasError}</Text>
          <TouchableOpacity
            onPress={() => {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[item.symbol];
                return newErrors;
              });
              fetchStockPrice(item.symbol)
                .then((priceData) => {
                  if (priceData && priceData.price !== undefined) {
                    const change = priceData.change || 0;
                    updateStockPrice(item.symbol, priceData.price, change);
                  }
                })
                .catch((error) => {
                  console.error(`Error fetching price for ${item.symbol}:`, error);
                  setErrors(prev => ({
                    ...prev,
                    [item.symbol]: 'Failed to fetch price'
                  }));
                });
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <StockCard stock={item} />;
  };

  return (
    <View style={styles.container}>
      {showPremiumBanner && <PremiumBanner />}
      
      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={renderStockCard}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading watchlist...</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Add your first stock</Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stock</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search stock symbol or name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={true}
            />

            <FlatList
              data={filteredStocks}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleAddStock(item.symbol)}
                >
                  <View>
                    <Text style={styles.suggestionSymbol}>{item.symbol}</Text>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noResults}>No stocks found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  skeletonCard: {
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
  skeletonSymbol: {
    width: 60,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 80,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonChange: {
    width: 60,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  errorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    flex: 1,
    marginLeft: 12,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestionName: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default WatchlistScreen;
