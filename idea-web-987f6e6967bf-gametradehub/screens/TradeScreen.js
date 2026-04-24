import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGameDetails } from '../utils/api';
import { createTradeRecord } from '../utils/firebase';
import { Ionicons } from '@expo/vector-icons';

const TradeScreen = ({ route }) => {
  const { barcode } = route.params;
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradeInProgress, setTradeInProgress] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await getGameDetails(barcode);
        setGameData(data);
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
        `Your trade for ${gameData.name} has been submitted successfully.`,
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
          <Text style={styles.gamePrice}>Market Price: ${gameData.price?.toFixed(2) || 'N/A'}</Text>
          <Ionicons name="pricetag-outline" size={20} color="#2E7D32" />
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={18} color="#555" />
          <Text style={styles.gameCondition}>Condition: {gameData.condition || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="logo-game-controller-b" size={18} color="#555" />
          <Text style={styles.gamePlatforms}>Platforms: {gameData.platforms || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#555" />
          <Text style={styles.gameRelease}>Release Date: {gameData.releaseDate || 'N/A'}</Text>
        </View>

        {gameData.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>{gameData.summary}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.tradeButton]}
            onPress={handleExecuteTrade}
            disabled={tradeInProgress}
          >
            {tradeInProgress ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Execute Trade</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderGameDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#6200EE',
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
    padding: 10,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  gameCover: {
    width: '100%',
    height: 300,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gamePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginRight: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameCondition: {
    fontSize: 16,
    marginLeft: 5,
    color: '#555',
  },
  gamePlatforms: {
    fontSize: 16,
    marginLeft: 5,
    color: '#555',
  },
  gameRelease: {
    fontSize: 16,
    marginLeft: 5,
    color: '#555',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  tradeButton: {
    backgroundColor: '#6200EE',
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradeScreen;
