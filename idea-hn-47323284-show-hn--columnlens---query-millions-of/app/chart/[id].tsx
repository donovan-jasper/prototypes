import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { generateChartConfig } from '../../lib/chart-generator';
import { useChartStore } from '../../store/charts';

const ChartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, data } = route.params;
  const { saveChart } = useChartStore();
  const [chartConfig, setChartConfig] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    if (data) {
      const config = generateChartConfig(data, chartType);
      setChartConfig(config);
    }
  }, [data, chartType]);

  const handleSaveChart = () => {
    if (chartConfig) {
      saveChart({
        id,
        config: chartConfig,
        name: `Chart ${id}`,
        type: chartType
      });
      navigation.goBack();
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting chart...');
  };

  const handleChangeChartType = (type) => {
    setChartType(type);
  };

  const renderChart = () => {
    if (!chartConfig) return null;

    const screenWidth = Dimensions.get('window').width - 32;

    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={chartConfig.data}
            width={screenWidth}
            height={220}
            yAxisLabel={chartConfig.yAxisLabel || ''}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero={true}
            style={styles.chart}
          />
        );
      case 'line':
        return (
          <LineChart
            data={chartConfig.data}
            width={screenWidth}
            height={220}
            yAxisLabel={chartConfig.yAxisLabel || ''}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={chartConfig.data}
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
      <View style={styles.chartTypeSelector}>
        <Button
          title="Bar"
          onPress={() => handleChangeChartType('bar')}
          color={chartType === 'bar' ? '#007AFF' : '#CCCCCC'}
        />
        <Button
          title="Line"
          onPress={() => handleChangeChartType('line')}
          color={chartType === 'line' ? '#007AFF' : '#CCCCCC'}
        />
        <Button
          title="Pie"
          onPress={() => handleChangeChartType('pie')}
          color={chartType === 'pie' ? '#007AFF' : '#CCCCCC'}
        />
      </View>

      {renderChart()}

      <View style={styles.buttonContainer}>
        <Button
          title="Save Chart"
          onPress={handleSaveChart}
        />
        <Button
          title="Export as PNG"
          onPress={handleExport}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default ChartScreen;
