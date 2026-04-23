import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { Text } from 'react-native-paper';

interface ScenarioChartProps {
  data: { x: number; y: number }[];
}

export default function ScenarioChart({ data }: ScenarioChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No data available for chart</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20, y: 20 }}
        height={300}
      >
        <VictoryAxis
          label="Valuation Multiplier"
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Equity Value ($)"
          style={{
            axisLabel: { padding: 40 }
          }}
        />
        <VictoryLine
          data={data}
          x="x"
          y="y"
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
    marginVertical: 16,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
