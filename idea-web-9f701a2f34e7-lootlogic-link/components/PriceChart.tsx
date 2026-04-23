import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { getPriceHistory } from '../lib/api/priceService';

interface PriceChartProps {
  itemId: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ itemId }) => {
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);

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
      <Text style={styles.title}>30-Day Price History</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        height={300}
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
          data={priceHistory}
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
});

export default PriceChart;
