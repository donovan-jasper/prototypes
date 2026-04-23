import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generateChartConfig } from '../../lib/chart-generator';
import ChartRenderer from '../../components/ChartRenderer';
import { useChartStore } from '../../store/charts';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const ChartScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, data } = route.params;
  const { saveChart } = useChartStore();
  const [chartConfig, setChartConfig] = useState(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxisColumn, setXAxisColumn] = useState<string | undefined>(undefined);
  const [yAxisColumn, setYAxisColumn] = useState<string | undefined>(undefined);
  const [groupByColumn, setGroupByColumn] = useState<string | undefined>(undefined);
  const [tooltipData, setTooltipData] = useState<{ label: string; value: number } | null>(null);
  const chartRef = useRef();

  useEffect(() => {
    if (data) {
      const config = generateChartConfig(
        data,
        chartType,
        xAxisColumn,
        yAxisColumn,
        groupByColumn
      );
      setChartConfig(config);
    }
  }, [data, chartType, xAxisColumn, yAxisColumn, groupByColumn]);

  const handleSaveChart = () => {
    if (chartConfig) {
      saveChart({
        id,
        config: chartConfig,
        name: `Chart ${id}`,
        type: chartType,
        xAxis: xAxisColumn,
        yAxis: yAxisColumn,
        groupBy: groupByColumn
      });
      navigation.goBack();
    }
  };

  const handleExport = async () => {
    try {
      if (!chartRef.current) return;

      const uri = await captureRef(chartRef, {
        format: 'png',
        quality: 1.0,
      });

      const fileUri = `${FileSystem.documentDirectory}chart_${id}.png`;
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Chart',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  const handleRegenerate = () => {
    if (data) {
      const config = generateChartConfig(
        data,
        chartType,
        xAxisColumn,
        yAxisColumn,
        groupByColumn
      );
      setChartConfig(config);
    }
  };

  const handleDataPointClick = (data: { index: number; value: number; label: string }) => {
    setTooltipData({
      label: data.label,
      value: data.value
    });
  };

  const handleTypeChange = (newType: 'bar' | 'line' | 'pie') => {
    setChartType(newType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart Visualization</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.chartContainer} ref={chartRef}>
          {chartConfig && (
            <ChartRenderer
              data={chartConfig.data}
              type={chartType}
              xAxisLabel={chartConfig.xAxisLabel}
              yAxisLabel={chartConfig.yAxisLabel}
              onDataPointClick={handleDataPointClick}
              onTypeChange={handleTypeChange}
            />
          )}
        </View>

        {tooltipData && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              {tooltipData.label}: {tooltipData.value}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRegenerate}
          >
            <Text style={styles.actionButtonText}>Regenerate Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveChart}
          >
            <Text style={styles.actionButtonText}>Save Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
          >
            <Text style={styles.actionButtonText}>Export as PNG</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ChartScreen;
