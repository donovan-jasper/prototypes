import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const ChartRenderer = ({ data, type = 'bar', yAxisLabel = '' }) => {
  const screenWidth = Dimensions.get('window').width - 32;

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
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth}
            height={220}
            yAxisLabel={yAxisLabel}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero={true}
            style={styles.chart}
          />
        );
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth}
            height={220}
            yAxisLabel={yAxisLabel}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default ChartRenderer;
