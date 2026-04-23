import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Modal, TouchableOpacity, ScrollView } from 'react-native';
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
  const [showConfigurator, setShowConfigurator] = useState(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart Visualization</Text>
      </View>

      <View style={styles.chartTypeSelector}>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'bar' && styles.activeButton]}
          onPress={() => setChartType('bar')}
        >
          <Text style={styles.chartTypeText}>Bar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'line' && styles.activeButton]}
          onPress={() => setChartType('line')}
        >
          <Text style={styles.chartTypeText}>Line</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'pie' && styles.activeButton]}
          onPress={() => setChartType('pie')}
        >
          <Text style={styles.chartTypeText}>Pie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer} ref={chartRef}>
        {chartConfig && (
          <ChartRenderer
            data={chartConfig.data}
            type={chartType}
            xAxisLabel={chartConfig.xAxisLabel}
            yAxisLabel={chartConfig.yAxisLabel}
            onDataPointClick={handleDataPointClick}
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

      <Modal
        visible={showConfigurator}
        animationType="slide"
        onRequestClose={() => setShowConfigurator(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>Chart Configuration</Text>
            <View style={styles.configOption}>
              <Text style={styles.configLabel}>X-Axis Column:</Text>
              <View style={styles.columnSelector}>
                {data?.columns.map((col, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.columnButton, xAxisColumn === col && styles.selectedColumn]}
                    onPress={() => setXAxisColumn(col)}
                  >
                    <Text style={styles.columnText}>{col}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.configOption}>
              <Text style={styles.configLabel}>Y-Axis Column:</Text>
              <View style={styles.columnSelector}>
                {data?.columns.map((col, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.columnButton, yAxisColumn === col && styles.selectedColumn]}
                    onPress={() => setYAxisColumn(col)}
                  >
                    <Text style={styles.columnText}>{col}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.configOption}>
              <Text style={styles.configLabel}>Group By Column (optional):</Text>
              <View style={styles.columnSelector}>
                <TouchableOpacity
                  style={[styles.columnButton, !groupByColumn && styles.selectedColumn]}
                  onPress={() => setGroupByColumn(undefined)}
                >
                  <Text style={styles.columnText}>None</Text>
                </TouchableOpacity>
                {data?.columns.map((col, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.columnButton, groupByColumn === col && styles.selectedColumn]}
                    onPress={() => setGroupByColumn(col)}
                  >
                    <Text style={styles.columnText}>{col}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowConfigurator(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartTypeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  chartTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  tooltip: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configOption: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  columnSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  columnButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedColumn: {
    backgroundColor: '#4CAF50',
  },
  columnText: {
    color: 'white',
  },
  modalButtonContainer: {
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChartScreen;
