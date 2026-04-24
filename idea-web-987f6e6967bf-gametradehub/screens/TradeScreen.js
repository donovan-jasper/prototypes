import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGameDetails } from '../utils/api';

const TradeScreen = ({ route }) => {
  const { barcode } = route.params;
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await getGameDetails(barcode);
        setGameData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [barcode]);

  const renderGameDetails = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#6200EE" style={styles.loader} />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
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
      <View style={styles.gameContainer}>
        {gameData.cover && (
          <Image
            source={{ uri: gameData.cover }}
            style={styles.gameCover}
            resizeMode="contain"
          />
        )}
        <Text style={styles.gameTitle}>{gameData.name}</Text>
        <Text style={styles.gamePrice}>Market Price: ${gameData.price.toFixed(2)}</Text>
        <Text style={styles.gameCondition}>Condition: {gameData.condition}</Text>
        <Text style={styles.gamePlatforms}>Platforms: {gameData.platforms}</Text>
        <Text style={styles.gameRelease}>Release Date: {gameData.releaseDate}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.tradeButton]}
            onPress={() => navigation.navigate('TradeExecution', { gameData })}
          >
            <Text style={styles.buttonText}>Execute Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => navigation.navigate('Inventory', { addGame: gameData })}
          >
            <Text style={styles.buttonText}>Add to Inventory</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Game Details</Text>
      {renderGameDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200EE',
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  gameContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameCover: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  gamePrice: {
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: 8,
  },
  gameCondition: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  gamePlatforms: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  gameRelease: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  tradeButton: {
    backgroundColor: '#6200EE',
  },
  addButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TradeScreen;
