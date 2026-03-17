import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
}

const screenWidth = Dimensions.get('window').width;

export default function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No chart data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        width={screenWidth - 32}
        height={300}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
      >
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: '#756f6a' },
            grid: { stroke: '#e6e6e6' },
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: '#756f6a' },
            grid: { stroke: 'transparent' },
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
        <VictoryLine
          data={data}
          x="date"
          y="price"
          style={{
            data: { stroke: '#4CAF50', strokeWidth: 2 },
            parent: { border: '1px solid #ccc' }
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
