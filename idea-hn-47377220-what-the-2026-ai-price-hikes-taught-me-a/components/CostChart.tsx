import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';
import { getCostProjection } from '../../services/costCalculator';

interface Props {
  data: Array<{ date: string; cost: number }>;
}

export default function CostChart({ data }: Props) {
  const screenWidth = Dimensions.get('window').width;

  const [projectedCost, setProjectedCost] = React.useState(0);
  const [savingsOpportunities, setSavingsOpportunities] = React.useState<string[]>([]);
  const [isFallback, setIsFallback] = React.useState(false);

  React.useEffect(() => {
    const fetchCostProjection = async () => {
      try {
        const { projectedCost, savingsOpportunities } = await getCostProjection(data);
        setProjectedCost(projectedCost);
        setSavingsOpportunities(savingsOpportunities);
      } catch (error) {
        console.error('Error getting cost projection:', error);
        const { projectedCost, savingsOpportunities } = getFallbackCostProjection(data);
        setProjectedCost(projectedCost);
        setSavingsOpportunities(savingsOpportunities);
        setIsFallback(true);
      }
    };

    fetchCostProjection();
  }, [data]);

  const chartData = {
    labels: data.map(d => new Date(d.date).getDate().toString()),
    datasets: [{
      data: data.map(d => d.cost),
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge">No usage data yet</Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Start logging your AI usage to see cost trends
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Daily Spending
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      <Text variant="bodyMedium" style={styles.projectedCost}>
        Projected Cost: ${projectedCost.toFixed(2)}
      </Text>
      {isFallback && (
        <Text variant="bodySmall" style={styles.fallbackNotice}>
          *Based on historical usage patterns (AI service unavailable)
        </Text>
      )}
      <View style={styles.savingsOpportunities}>
        {savingsOpportunities.map((opportunity, index) => (
          <Text key={index} variant="bodySmall" style={styles.opportunity}>
            {opportunity}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666',
  },
  projectedCost: {
    marginTop: 12,
    color: '#4CAF50',
  },
  fallbackNotice: {
    marginTop: 4,
    color: '#666',
  },
  savingsOpportunities: {
    marginTop: 12,
  },
  opportunity: {
    marginBottom: 8,
    color: '#666',
  },
});
