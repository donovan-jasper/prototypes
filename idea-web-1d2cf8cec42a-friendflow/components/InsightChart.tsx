import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';

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
  chartConfig
}) => {
  const theme = useTheme();

  const defaultChartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Title>
        <BarChart
          data={data}
          width={screenWidth - 32}
          height={220}
          yAxisLabel={yAxisLabel}
          yAxisSuffix={yAxisSuffix}
          chartConfig={chartConfig || defaultChartConfig}
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
