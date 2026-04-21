import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  data: Array<{ date: string; cost: number }>;
}

export default function CostChart({ data }: Props) {
  // Temporary placeholder since react-native-chart-kit is not available
  return (
    <View style={styles.container}>
      <Text>Cost Chart (Chart library not available)</Text>
      {data.length > 0 ? (
        <Text>Data points: {data.length}</Text>
      ) : (
        <Text>No data available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
