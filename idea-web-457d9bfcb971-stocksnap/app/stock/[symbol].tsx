import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { fetchStockData, fetchStockChartData } from '../../lib/api';
import PriceChart from '../../components/PriceChart';
import { useWatchlistStore } from '../../store/useWatchlistStore';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const navigation = useNavigation();
  const [stockData, setStockData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { stocks, addStock, removeStock } = useWatchlistStore();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [data, chart] = await Promise.all([
          fetchStockData(symbol),
          fetchStockChartData(symbol)
        ]);
        setStockData(data);
        setChartData(chart);
      } catch (err) {
        setError('Failed to load stock data. Please try again.');
        console.error('Stock detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol]);

  useEffect(() => {
    if (stockData) {
      setIsInWatchlist(stocks.some(stock => stock.symbol === stockData.symbol));
    }
  }, [stockData, stocks]);

  const handleWatchlistToggle = () => {
    if (!stockData) return;

    if (isInWatchlist) {
      removeStock(stockData.symbol);
    } else {
      addStock({
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!stockData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stock not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{stockData.symbol}</Text>
        <Text style={styles.name}>{stockData.name}</Text>
        <Text style={styles.price}>${stockData.price.toFixed(2)}</Text>
        <View style={styles.changeContainer}>
          <Text style={[styles.changeText, {
            color: stockData.change >= 0 ? '#4CAF50' : '#F44336'
          }]}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <PriceChart data={chartData} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About {stockData.name}</Text>
        <Text style={styles.description}>{stockData.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Market Cap</Text>
            <Text style={styles.metricValue}>
              ${stockData.marketCap.toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>52 Week Range</Text>
            <Text style={styles.metricValue}>
              ${stockData.week52Low.toFixed(2)} - ${stockData.week52High.toFixed(2)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Volume</Text>
            <Text style={styles.metricValue}>
              {stockData.volume.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.watchlistButton, {
          backgroundColor: isInWatchlist ? '#F44336' : '#4CAF50'
        }]}
        onPress={handleWatchlistToggle}
      >
        <Text style={styles.watchlistButtonText}>
          {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
  },
  changeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartContainer: {
    height: 300,
    marginVertical: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  watchlistButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchlistButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
