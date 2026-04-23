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
      // Auto-select first two columns for X and Y axes if not specified
      if (!xAxisColumn && data.columns.length > 0) {
        setXAxisColumn(data.columns[0]);
      }
      if (!yAxisColumn && data.columns.length > 1) {
        setYAxisColumn(data.columns[1]);
      }

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
          <ChartRenderer
            data={data}
            initialType={chartType}
            onDataPointClick={handleDataPointClick}
            onTypeChange={handleTypeChange}
          />
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
            style={[styles.button, styles.regenerateButton]}
            onPress={handleRegenerate}
          >
            <Text style={styles.buttonText}>Regenerate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveChart}
          >
            <Text style={styles.buttonText}>Save Chart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text style={styles.buttonText}>
              {isExporting ? 'Exporting...' : 'Export as PNG'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  axisControl: {
    marginBottom: 12,
  },
  axisLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  axisPicker: {
    height: 50,
    width: '100%',
  },
  chartContainer: {
    marginVertical: 16,
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  regenerateButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  exportButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChartScreen;
