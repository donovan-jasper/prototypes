import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Card, Title } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

interface InsightChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  title: string;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  chartConfig?: any;
}

const InsightChart: React.FC<InsightChartProps> = ({
  data,
  title,
  yAxisLabel = '',
  yAxisSuffix = '',
  chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  }
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{title}</Title>
        <BarChart
          data={data}
          width={screenWidth - 32}
          height={220}
          yAxisLabel={yAxisLabel}
          yAxisSuffix={yAxisSuffix}
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={true}
          withInnerLines={false}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default InsightChart;
