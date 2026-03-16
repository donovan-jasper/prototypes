import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

interface StatsChartProps {
  data: number[];
  type: 'completion' | 'hours';
}

const StatsChart: React.FC<StatsChartProps> = ({ data, type }) => {
  const maxValue = Math.max(...data, 100); // Ensure at least 100 for percentage

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width="100%" height="100" viewBox={`0 0 ${data.length * 40} 100`}>
          {data.map((value, index) => {
            const height = (value / maxValue) * 100;
            return (
              <Rect
                key={index}
                x={index * 40}
                y={100 - height}
                width={30}
                height={height}
                fill="#6c5ce7"
                rx={5}
                ry={5}
              />
            );
          })}
        </Svg>
      </View>
      <View style={styles.labelsContainer}>
        {data.map((value, index) => (
          <Text key={index} style={styles.label}>
            {type === 'completion' ? `${value}%` : value}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  chartContainer: {
    height: 100,
    marginBottom: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    color: '#636e72',
    width: 30,
    textAlign: 'center',
  },
});

export default StatsChart;
