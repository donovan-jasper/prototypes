import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressChartProps {
  data: number[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((value, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={[
              styles.bar,
              { height: `${value * 100}%`, backgroundColor: value > 0 ? '#6200EE' : '#eee' }
            ]} />
            <Text style={styles.dayLabel}>{days[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    alignItems: 'flex-end',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '60%',
    borderRadius: 5,
    marginBottom: 5,
  },
  dayLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
});

export default ProgressChart;
