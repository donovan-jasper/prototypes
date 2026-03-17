import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

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
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(x) => `$${x / 1000}k`}
        />
        <VictoryAxis
          tickFormat={(x) => `${x * 10}%`}
        />
        <VictoryLine
          data={data}
          style={{
            data: { stroke: '#4CAF50' },
            parent: { border: '1px solid #ccc' }
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  title: {
    textAlign: 'center',
    marginBottom: 8
  }
});
