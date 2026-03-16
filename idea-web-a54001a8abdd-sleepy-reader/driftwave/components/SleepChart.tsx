import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface SleepChartProps {
  data: Array<{
    date: string;
    duration: number;
    quality: number;
  }>;
}

const SleepChart: React.FC<SleepChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        data: data.map(item => item.duration / 60), // Convert minutes to hours
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix="h"
        yAxisInterval={1}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default SleepChart;
