import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { generateChartConfig } from '../../lib/chart-generator';
import { useChartStore } from '../../store/charts';

const ChartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, data } = route.params;
  const { saveChart } = useChartStore();
  const [chartConfig, setChartConfig] = useState(null);

  useEffect(() => {
    const config = generateChartConfig(data, 'bar');
    setChartConfig(config);
  }, [data]);

  const handleSaveChart = () => {
    saveChart({ id, config: chartConfig, name: `Chart ${id}` });
  };

  const handleExport = () => {
    // Implement export functionality
  };

  return (
    <View style={styles.container}>
      {chartConfig && (
        <BarChart
          data={chartConfig.data}
          width={300}
          height={200}
          yAxisLabel="$"
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      )}
      <Button title="Save Chart" onPress={handleSaveChart} />
      <Button title="Export as PNG" onPress={handleExport} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ChartScreen;
