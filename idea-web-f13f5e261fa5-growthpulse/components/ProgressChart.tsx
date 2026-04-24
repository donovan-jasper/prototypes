import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
  data: number[];
  habitName: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, habitName }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6200EE',
    },
  };

  const chartData = {
    labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'],
    datasets: [
      {
        data: data,
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: [`${habitName} Completion`],
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Last 7 Days</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 64}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={false}
        fromZero={true}
        yAxisSuffix=""
        yAxisInterval={1}
        yLabelsOffset={10}
        xLabelsOffset={-5}
        segments={1}
        formatYLabel={(value) => value === 1 ? 'Done' : ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
});

export default ProgressChart;
