import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory-native';

interface ScenarioChartProps {
  data: { x: number; y: number }[];
  title: string;
}

export default function ScenarioChart({ data, title }: ScenarioChartProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <VictoryChart
        theme={VictoryTheme.material}
        height={300}
        width={350}
        padding={{ top: 40, bottom: 50, left: 50, right: 20 }}
        domainPadding={{ x: 20 }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(x) => `$${(x / 1000).toFixed(0)}k`}
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryAxis
          tickFormat={(x) => `${x * 10}%`}
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryLine
          data={data}
          style={{
            data: { stroke: '#4CAF50', strokeWidth: 3 },
            parent: { border: '1px solid #ccc' }
          }}
          interpolation="natural"
        />
        <VictoryLabel
          text="Valuation Increase (%)"
          x={175}
          y={280}
          textAnchor="middle"
        />
        <VictoryLabel
          text="Equity Value ($)"
          x={25}
          y={150}
          textAnchor="middle"
          angle={-90}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold'
  }
});
