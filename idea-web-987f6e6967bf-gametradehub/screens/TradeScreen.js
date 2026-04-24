import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGameDetails, getGamePriceHistory } from '../utils/api';
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
  const [matchedTrade, setMatchedTrade] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const data = await getGameDetails(barcode);
        setGameData(data);

        // Fetch real price history from API
        const history = await getGamePriceHistory(data.id);
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
      // Simulate trade matching algorithm
      const potentialMatches = [
        { price: gameData.price * 0.95, seller: 'GameDeals', condition: 'New' },
        { price: gameData.price * 0.9, seller: 'LocalGamer', condition: 'Used - Like New' },
        { price: gameData.price * 0.85, seller: 'RetroGamer', condition: 'Used - Good' }
      ];

      // Select the best match (highest price)
      const bestMatch = potentialMatches.reduce((prev, current) =>
        (prev.price > current.price) ? prev : current
      );

      const tradeId = await createTradeRecord({
        gameId: gameData.id,
        gameName: gameData.name,
        price: bestMatch.price,
        condition: bestMatch.condition,
        seller: bestMatch.seller,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      setMatchedTrade({
        ...bestMatch,
        tradeId,
        gameName: gameData.name,
        gameCover: gameData.cover
      });

      setShowConfirmation(true);
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
        <View style={styles.gameInfoContainer}>
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Platform:</Text>
            <Text style={styles.gameInfoValue}>{gameData.platforms}</Text>
          </View>
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Release Date:</Text>
            <Text style={styles.gameInfoValue}>{gameData.releaseDate}</Text>
          </View>
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Genres:</Text>
            <Text style={styles.gameInfoValue}>{gameData.genres}</Text>
          </View>
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Developer:</Text>
            <Text style={styles.gameInfoValue}>{gameData.developer}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>Current Market Price: ${gameData.price.toFixed(2)}</Text>
          <Text style={styles.conditionText}>Condition: {gameData.condition}</Text>
        </View>

        {renderPriceHistory()}

        <TouchableOpacity
          style={styles.tradeButton}
          onPress={handleExecuteTrade}
          disabled={tradeInProgress}
        >
          {tradeInProgress ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.tradeButtonText}>Find Best Trade Match</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderGameDetails()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trade Matched!</Text>

            {matchedTrade?.gameCover && (
              <Image
                source={{ uri: matchedTrade.gameCover }}
                style={styles.modalGameCover}
                resizeMode="contain"
              />
            )}

            <Text style={styles.modalGameName}>{matchedTrade?.gameName}</Text>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Seller:</Text>
                <Text style={styles.modalDetailValue}>{matchedTrade?.seller}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Price:</Text>
                <Text style={styles.modalDetailValue}>${matchedTrade?.price.toFixed(2)}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Condition:</Text>
                <Text style={styles.modalDetailValue}>{matchedTrade?.condition}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Trade ID:</Text>
                <Text style={styles.modalDetailValue}>{matchedTrade?.tradeId}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowConfirmation(false);
                navigation.navigate('Inventory');
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
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
  gameContainer: {
    flex: 1,
    padding: 16,
  },
  gameCover: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  gameInfoContainer: {
    marginBottom: 20,
  },
  gameInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gameInfoLabel: {
    fontWeight: '600',
    marginRight: 8,
    color: '#666',
    width: 100,
  },
  gameInfoValue: {
    flex: 1,
    color: '#333',
  },
  priceContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 16,
    color: '#666',
  },
  priceHistoryContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  priceChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    alignItems: 'flex-end',
  },
  priceBarContainer: {
    alignItems: 'center',
    width: (width - 48) / 7,
  },
  priceBar: {
    width: '60%',
    backgroundColor: '#6200EE',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  priceBarLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  priceBarDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  tradeButton: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
    fontSize: 16,
    color: '#d32f2f',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  modalGameCover: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 8,
  },
  modalGameName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalDetails: {
    width: '100%',
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  modalDetailLabel: {
    fontWeight: '600',
    color: '#666',
  },
  modalDetailValue: {
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradeScreen;
