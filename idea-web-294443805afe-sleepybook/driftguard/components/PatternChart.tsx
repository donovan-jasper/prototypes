import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

const PatternChart = ({ data }) => {
  const chartWidth = 300;
  const chartHeight = 200;
  const barWidth = chartWidth / data.length;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((session, index) => (
          <Rect
            key={index}
            x={index * barWidth}
            y={chartHeight - (session.duration / 60) * 10}
            width={barWidth - 2}
            height={(session.duration / 60) * 10}
            fill="blue"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default PatternChart;
