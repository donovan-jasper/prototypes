import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import PriceChart from '../../components/PriceChart';
import { fetchItemPrice, getPriceHistory, shouldBuyNow } from '../../lib/api/priceService';
import { Ionicons } from '@expo/vector-icons';

const ItemDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { items } = useInventoryStore();
  const [item, setItem] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundItem = items.find(i => i.id === id);
    if (foundItem) {
      setItem(foundItem);
    }
  }, [id, items]);

  useEffect(() => {
    if (!item) return;

    const loadPriceData = async () => {
      try {
        const price = await fetchItemPrice(item.game, item.id);
        setCurrentPrice(price);

        const history = await getPriceHistory(item.id);
        const avg = history.reduce((sum, day) => sum + day.price, 0) / history.length;
        setAveragePrice(avg);
      } catch (error) {
        console.error('Error loading price data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPriceData();
  }, [item]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03A9F4" />
        <Text>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const getRarityColor = () => {
    switch (item.rarity.toLowerCase()) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const getBuyRecommendation = () => {
    if (currentPrice === null || averagePrice === null) return null;

    const buyNow = shouldBuyNow(currentPrice, averagePrice);
    const priceChange = ((currentPrice - averagePrice) / averagePrice) * 100;

    if (buyNow) {
      return (
        <View style={[styles.recommendation, styles.buyNow]}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.recommendationText}>Buy Now</Text>
          <Text style={styles.recommendationDetail}>
            {priceChange.toFixed(1)}% below 30-day average
          </Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.recommendation, styles.wait]}>
          <Ionicons name="time" size={24} color="white" />
          <Text style={styles.recommendationText}>Wait</Text>
          <Text style={styles.recommendationDetail}>
            {priceChange.toFixed(1)}% above 30-day average
          </Text>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.game}>{item.game}</Text>
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
          <Text style={styles.rarityText}>{item.rarity}</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.currentPrice}>Current Price: ${currentPrice?.toFixed(2)}</Text>
        <Text style={styles.avgPrice}>30-Day Average: ${averagePrice?.toFixed(2)}</Text>
        {getBuyRecommendation()}
      </View>

      <PriceChart itemId={item.id} />
    </ScrollView>
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
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  game: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  avgPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buyNow: {
    backgroundColor: '#2ECC71',
  },
  wait: {
    backgroundColor: '#E74C3C',
  },
  recommendationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 12,
  },
  recommendationDetail: {
    color: 'white',
    fontSize: 14,
  },
});

export default ItemDetailScreen;
