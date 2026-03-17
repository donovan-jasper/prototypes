import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePortfolio } from '../hooks/usePortfolio';
import { Ionicons } from '@expo/vector-icons';

const HoldingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { holdingId } = route.params;
  const { portfolio, loading, updateHolding, deleteHolding } = usePortfolio();
  const [holding, setHolding] = useState(null);

  useEffect(() => {
    if (!loading && portfolio.holdings) {
      const foundHolding = portfolio.holdings.find(h => h.id === holdingId);
      if (foundHolding) {
        setHolding(foundHolding);
      } else {
        Alert.alert('Error', 'Holding not found');
        navigation.goBack();
      }
    }
  }, [loading, portfolio.holdings, holdingId]);

  const handleDelete = async () => {
    Alert.alert(
      'Delete Holding',
      'Are you sure you want to delete this holding?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHolding(holdingId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete holding');
            }
          },
        },
      ]
    );
  };

  if (loading || !holding) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{holding.symbol}</Text>
        <Text style={styles.assetType}>{holding.assetType}</Text>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Shares:</Text>
          <Text style={styles.detailValue}>{holding.shares}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cost Basis:</Text>
          <Text style={styles.detailValue}>${holding.costBasis.toFixed(2)} per share</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Price:</Text>
          <Text style={styles.detailValue}>${holding.currentPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Value:</Text>
          <Text style={styles.detailValue}>${holding.currentValue.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gain/Loss:</Text>
          <Text style={[styles.detailValue, holding.gain >= 0 ? styles.positive : styles.negative]}>
            {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Percentage Gain:</Text>
          <Text style={[styles.detailValue, holding.percentGain >= 0 ? styles.positive : styles.negative]}>
            {holding.percentGain.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('edit-holding', { holding })}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  symbol: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailSection: {
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HoldingDetailScreen;
