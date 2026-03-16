import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine } from 'victory-native';

interface PriceData {
  x: number;
  y: number;
}

interface PriceChartProps {
  data: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <VictoryChart>
        <VictoryLine data={data} />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PriceChart;
