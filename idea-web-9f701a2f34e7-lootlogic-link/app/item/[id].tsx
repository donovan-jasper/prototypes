import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import { getPriceHistory } from '../../lib/api/priceService';
import PriceChart from '../../components/PriceChart';

type Period = 7 | 30 | 90;

const ItemDetail = () => {
  const { id } = useLocalSearchParams();
  const { items } = useInventoryStore();
  const [priceHistory, setPriceHistory] = useState<Array<{ x: number; y: number }>>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(30);
  const [loading, setLoading] = useState(true);

  const item = items.find(i => i.id === id);

  useEffect(() => {
    const fetchPriceData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const history = await getPriceHistory(String(id));
        const transformedData = history.map((entry, index) => ({
          x: index,
          y: entry.price
        }));
        setPriceHistory(transformedData);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [id]);

  const getFilteredData = () => {
    const endIndex = priceHistory.length;
    const startIndex = Math.max(0, endIndex - selectedPeriod);
    return priceHistory.slice(startIndex).map((entry, index) => ({
      x: index,
      y: entry.y
    }));
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemGame}>{item.game}</Text>
        <Text style={styles.itemRarity}>{item.rarity}</Text>
        <Text style={styles.itemValue}>${item.value}</Text>
      </View>

      <View style={styles.periodToggle}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 7 && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod(7)}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 7 && styles.periodButtonTextActive]}>
            7D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 30 && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod(30)}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 30 && styles.periodButtonTextActive]}>
            30D
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 90 && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod(90)}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 90 && styles.periodButtonTextActive]}>
            90D
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03A9F4" />
        </View>
      ) : (
        <PriceChart data={getFilteredData()} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemGame: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  itemRarity: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  itemValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#03A9F4',
  },
  periodToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 70,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#03A9F4',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ItemDetail;
