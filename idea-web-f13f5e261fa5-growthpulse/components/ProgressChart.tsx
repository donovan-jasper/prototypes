import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
  data: number[];
  habitName: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, habitName }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
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
    legend: [habitName],
  };

  return (
    <View style={styles.chartContainer}>
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
        withVerticalLabels={true}
        withHorizontalLabels={false}
        segments={1}
        formatYLabel={(yValue) => yValue === '1' ? 'Done' : ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 8,
  },
});

export default ProgressChart;
