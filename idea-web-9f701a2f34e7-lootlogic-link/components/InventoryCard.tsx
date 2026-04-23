import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchItemPrice, getPriceHistory, shouldBuyNow } from '../lib/api/priceService';
import { useAlertStore } from '../lib/stores/alertStore';
import { Ionicons } from '@expo/vector-icons';

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
}

interface InventoryCardProps {
  item: Item;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  const router = useRouter();
  const { rules } = useAlertStore();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);
  const [isAlertItem, setIsAlertItem] = useState(false);

  useEffect(() => {
    const checkAlertStatus = () => {
      const matchingRule = rules.find(rule =>
        rule.game === item.game &&
        rule.itemName === item.name &&
        rule.targetPrice >= (currentPrice || 0)
      );
      setIsAlertItem(!!matchingRule);
    };

    if (currentPrice !== null) {
      checkAlertStatus();
    }
  }, [currentPrice, rules, item]);

  useEffect(() => {
    const loadPriceData = async () => {
      try {
        const price = await fetchItemPrice(item.game, item.id);
        setCurrentPrice(price);

        const history = await getPriceHistory(item.id);
        const avg = history.reduce((sum, day) => sum + day.price, 0) / history.length;
        setAveragePrice(avg);
      } catch (error) {
        console.error('Error loading price data:', error);
      }
    };

    loadPriceData();
  }, [item]);

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const getRarityColor = () => {
    switch (item.rarity.toLowerCase()) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      case 'common': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const getPriceIndicator = () => {
    if (currentPrice === null || averagePrice === null) return null;

    const buyRecommendation = shouldBuyNow(currentPrice, averagePrice);
    const priceChange = ((currentPrice - averagePrice) / averagePrice) * 100;

    if (priceChange > 5) {
      return (
        <View style={styles.priceIndicator}>
          <Ionicons name="arrow-up" size={16} color="#E74C3C" />
          <Text style={[styles.priceChangeText, { color: '#E74C3C' }]}>
            {priceChange.toFixed(1)}%
          </Text>
        </View>
      );
    } else if (priceChange < -5) {
      return (
        <View style={styles.priceIndicator}>
          <Ionicons name="arrow-down" size={16} color="#2ECC71" />
          <Text style={[styles.priceChangeText, { color: '#2ECC71' }]}>
            {Math.abs(priceChange).toFixed(1)}%
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.priceIndicator}>
          <Ionicons name="ellipse" size={16} color="#F39C12" />
          <Text style={[styles.priceChangeText, { color: '#F39C12' }]}>
            Stable
          </Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isAlertItem && styles.alertCard]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
          {item.rarity}
        </Text>
        {isAlertItem && (
          <Ionicons
            name="notifications"
            size={18}
            color="#E74C3C"
            style={styles.alertIcon}
          />
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.game}>{item.game}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.value}>${currentPrice !== null ? currentPrice.toFixed(2) : '...'}</Text>
        {getPriceIndicator()}
      </View>

      <Text style={styles.avgPrice}>
        30-day avg: ${averagePrice !== null ? averagePrice.toFixed(2) : '...'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    minHeight: 150,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  alertCard: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    overflow: 'hidden',
  },
  alertIcon: {
    marginRight: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  game: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03A9F4',
    marginRight: 8,
  },
  priceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  avgPrice: {
    fontSize: 12,
    color: '#666',
  },
});

export default InventoryCard;
