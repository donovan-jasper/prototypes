import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGameDetails } from '../utils/api';
import { createTradeRecord } from '../utils/firebase';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TradeScreen = ({ route }) => {
  const { barcode } = route.params;
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeInProgress, setTradeInProgress] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await getGameDetails(barcode);
        setGameData(data);

        // Generate mock price history for demonstration
        const history = [];
        const basePrice = data.price;
        for (let i = 0; i < 7; i++) {
          const variation = (Math.random() - 0.5) * 5; // Random variation between -2.5 and +2.5
          history.push({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            price: Math.max(5, basePrice + variation) // Ensure price doesn't go below $5
          });
        }
        setPriceHistory(history);
      } catch (err) {
        setError(err.message || 'Failed to fetch game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [barcode]);

  const handleExecuteTrade = async () => {
    if (!gameData) return;

    setTradeInProgress(true);
    try {
      const tradeId = await createTradeRecord({
        gameId: gameData.id,
        gameName: gameData.name,
        price: gameData.price,
        condition: gameData.condition,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      Alert.alert(
        'Trade Submitted',
        `Your trade for ${gameData.name} has been submitted successfully. Trade ID: ${tradeId}`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Inventory') }
        ]
      );
    } catch (err) {
      Alert.alert('Trade Failed', err.message || 'Failed to execute trade. Please try again.');
    } finally {
      setTradeInProgress(false);
    }
  };

  const renderPriceHistory = () => {
    if (priceHistory.length === 0) return null;

    const maxPrice = Math.max(...priceHistory.map(item => item.price));
    const minPrice = Math.min(...priceHistory.map(item => item.price));

    return (
      <View style={styles.priceHistoryContainer}>
        <Text style={styles.sectionTitle}>Price History (7 days)</Text>
        <View style={styles.priceChart}>
          {priceHistory.map((item, index) => {
            const height = ((item.price - minPrice) / (maxPrice - minPrice)) * 100;
            return (
              <View key={index} style={styles.priceBarContainer}>
                <View style={[styles.priceBar, { height: `${height}%` }]} />
                <Text style={styles.priceBarLabel}>${item.price.toFixed(2)}</Text>
                <Text style={styles.priceBarDate}>{item.date}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderGameDetails = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Fetching game details...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#d32f2f" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!gameData) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="game-controller-outline" size={50} color="#6200EE" />
          <Text style={styles.errorText}>No game data found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.gameContainer}>
        {gameData.cover && (
          <Image
            source={{ uri: gameData.cover }}
            style={styles.gameCover}
            resizeMode="contain"
          />
        )}
        <Text style={styles.gameTitle}>{gameData.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.gamePrice}>Market Price: ${gameData.price.toFixed(2)}</Text>
          <Text style={styles.gameCondition}>Condition: {gameData.condition}</Text>
        </View>

        {renderPriceHistory()}

        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() => setShowConfirmation(true)}
          disabled={tradeInProgress}
        >
          {tradeInProgress ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.tradeButtonText}>Execute Trade</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderConfirmationModal = () => {
    if (!gameData) return null;

    const currentPrice = gameData.price;
    const potentialProfit = currentPrice * 0.1; // Assuming 10% potential profit for demo

    return (
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Trade Execution</Text>

            <View style={styles.modalGameInfo}>
              <Image
                source={{ uri: gameData.cover }}
                style={styles.modalGameCover}
                resizeMode="contain"
              />
              <View style={styles.modalGameDetails}>
                <Text style={styles.modalGameName}>{gameData.name}</Text>
                <Text style={styles.modalGamePrice}>Price: ${currentPrice.toFixed(2)}</Text>
                <Text style={styles.modalGameCondition}>Condition: {gameData.condition}</Text>
              </View>
            </View>

            <View style={styles.modalProfitContainer}>
              <Text style={styles.modalProfitTitle}>Potential Profit:</Text>
              <Text style={styles.modalProfitAmount}>${potentialProfit.toFixed(2)}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  setShowConfirmation(false);
                  handleExecuteTrade();
                }}
              >
                <Text style={styles.modalButtonText}>Confirm Trade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderGameDetails()}
      {renderConfirmationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  gameCover: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  priceContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gamePrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 5,
  },
  gameCondition: {
    fontSize: 16,
    color: '#666',
  },
  priceHistoryContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  priceChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingVertical: 10,
  },
  priceBarContainer: {
    alignItems: 'center',
    width: (width - 60) / 7,
  },
  priceBar: {
    width: 20,
    backgroundColor: '#6200EE',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 5,
  },
  priceBarLabel: {
    fontSize: 12,
    color: '#333',
  },
  priceBarDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  tradeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalGameInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalGameCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  modalGameDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  modalGameName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  modalGamePrice: {
    fontSize: 16,
    color: '#6200EE',
    marginBottom: 5,
  },
  modalGameCondition: {
    fontSize: 14,
    color: '#666',
  },
  modalProfitContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalProfitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  modalProfitAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalConfirmButton: {
    backgroundColor: '#6200EE',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TradeScreen;
