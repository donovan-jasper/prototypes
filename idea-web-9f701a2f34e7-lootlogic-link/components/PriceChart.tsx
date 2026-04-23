import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryVoronoiContainer } from 'victory-native';
import { getPriceHistory } from '../lib/api/priceService';

interface PriceChartProps {
  itemId: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ itemId }) => {
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const loadPriceHistory = async () => {
      try {
        const history = await getPriceHistory(itemId);
        setPriceHistory(history);
      } catch (error) {
        console.error('Error loading price history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPriceHistory();
  }, [itemId]);

  const getFilteredData = () => {
    if (timeRange === '7d') {
      return priceHistory.slice(-7);
    } else if (timeRange === '90d') {
      return priceHistory;
    }
    return priceHistory.slice(-30);
  };

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
      <Text style={styles.title}>Price History</Text>

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
    marginBottom: 10,
    textAlign: 'center',
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
});

export default PriceChart;
