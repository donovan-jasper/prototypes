import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generateChartConfig } from '../../lib/chart-generator';
import ChartRenderer from '../../components/ChartRenderer';
import { useChartStore } from '../../store/charts';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';

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
  const [isExporting, setIsExporting] = useState(false);
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
      setIsExporting(true);
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
    } finally {
      setIsExporting(false);
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

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading chart data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart Visualization</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.axisControls}>
          <View style={styles.axisControl}>
            <Text style={styles.axisLabel}>X-Axis:</Text>
            <Picker
              selectedValue={xAxisColumn}
              style={styles.axisPicker}
              onValueChange={(itemValue) => setXAxisColumn(itemValue)}
            >
              {data.columns.map((col, index) => (
                <Picker.Item key={index} label={col} value={col} />
              ))}
            </Picker>
          </View>

          <View style={styles.axisControl}>
            <Text style={styles.axisLabel}>Y-Axis:</Text>
            <Picker
              selectedValue={yAxisColumn}
              style={styles.axisPicker}
              onValueChange={(itemValue) => setYAxisColumn(itemValue)}
            >
              {data.columns.map((col, index) => (
                <Picker.Item key={index} label={col} value={col} />
              ))}
            </Picker>
          </View>

          <View style={styles.axisControl}>
            <Text style={styles.axisLabel}>Group By:</Text>
            <Picker
              selectedValue={groupByColumn}
              style={styles.axisPicker}
              onValueChange={(itemValue) => setGroupByColumn(itemValue)}
            >
              <Picker.Item label="None" value={undefined} />
              {data.columns.map((col, index) => (
                <Picker.Item key={index} label={col} value={col} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.chartContainer} ref={chartRef}>
          {chartConfig && (
            <ChartRenderer
              data={chartConfig.data}
              initialType={chartType}
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
            style={[styles.actionButton, isExporting && styles.disabledButton]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Export as PNG</Text>
            )}
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
  axisControls: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  axisControl: {
    marginBottom: 8,
  },
  axisLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  axisPicker: {
    height: 50,
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChartScreen;
