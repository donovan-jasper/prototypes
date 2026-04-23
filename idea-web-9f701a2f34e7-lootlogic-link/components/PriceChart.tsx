import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryVoronoiContainer } from 'victory-native';
import { fetchItemPrice, getPriceHistory } from '../lib/api/priceService';

interface PriceChartProps {
  itemId: string;
  game: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ itemId, game }) => {
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch current price
        const price = await fetchItemPrice(game, itemId);
        setCurrentPrice(price);

        // Fetch historical data
        const history = await getPriceHistory(itemId);
        setPriceHistory(history);
      } catch (error) {
        console.error('Error loading price data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [itemId, game]);

  const getFilteredData = () => {
    if (timeRange === '7d') {
      return priceHistory.slice(-7);
    } else if (timeRange === '90d') {
      return priceHistory;
    }
    return priceHistory.slice(-30);
  };

  const calculateTrend = () => {
    if (priceHistory.length < 2) return 'stable';

    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;

    if (lastPrice > firstPrice * 1.1) return 'up';
    if (lastPrice < firstPrice * 0.9) return 'down';
    return 'stable';
  };

  const trend = calculateTrend();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03A9F4" />
        <Text>Loading price history...</Text>
      </View>
    );
  }

  if (priceHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No price history available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price History</Text>
        {currentPrice !== null && (
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
            <View style={[styles.trendIndicator, trend === 'up' ? styles.upTrend : trend === 'down' ? styles.downTrend : styles.stableTrend]}>
              <Text style={styles.trendText}>
                {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '→'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '7d' && styles.activeTimeRange]}
          onPress={() => setTimeRange('7d')}
        >
          <Text style={styles.timeRangeText}>7 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '30d' && styles.activeTimeRange]}
          onPress={() => setTimeRange('30d')}
        >
          <Text style={styles.timeRangeText}>30 Days</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '90d' && styles.activeTimeRange]}
          onPress={() => setTimeRange('90d')}
        >
          <Text style={styles.timeRangeText}>90 Days</Text>
        </TouchableOpacity>
      </View>

      <VictoryChart
        theme={VictoryTheme.material}
        height={300}
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }) => `Date: ${datum.date}\nPrice: $${datum.price.toFixed(2)}`}
          />
        }
      >
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: '#756f6a' },
            grid: { stroke: 'rgba(117, 111, 106, 0.2)' },
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: '#756f6a' },
            grid: { stroke: 'rgba(117, 111, 106, 0.2)' },
            tickLabels: { fontSize: 8, padding: 5, angle: -45 }
          }}
        />
        <VictoryLine
          data={getFilteredData()}
          x="date"
          y="price"
          style={{
            data: { stroke: '#03A9F4', strokeWidth: 2 },
            parent: { border: '1px solid #ccc' }
          }}
        />
      </VictoryChart>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {trend === 'up' ? 'Price is increasing' : trend === 'down' ? 'Price is decreasing' : 'Price is stable'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#03A9F4',
    marginRight: 5,
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upTrend: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  downTrend: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  stableTrend: {
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  activeTimeRange: {
    backgroundColor: '#03A9F4',
  },
  timeRangeText: {
    color: '#333',
    fontSize: 12,
  },
  footer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default PriceChart;
