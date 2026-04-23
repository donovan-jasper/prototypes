import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { generateChartConfig } from '../../lib/chart-generator';
import ChartRenderer from '../../components/ChartRenderer';
import ChartConfigurator from '../../components/ChartConfigurator';
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
  const chartRef = React.useRef();

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

  const handleConfigChange = (config: {
    xAxis: string;
    yAxis: string;
    groupBy?: string;
    chartType: 'bar' | 'line' | 'pie';
  }) => {
    setXAxisColumn(config.xAxis);
    setYAxisColumn(config.yAxis);
    setGroupByColumn(config.groupBy);
    setChartType(config.chartType);
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
        <Text style={styles.title}>Chart Configuration</Text>
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => setShowConfigurator(true)}
        >
          <Text style={styles.configButtonText}>Configure</Text>
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
        <Button
          title="Save Chart"
          onPress={handleSaveChart}
        />
        <Button
          title="Export as PNG"
          onPress={handleExport}
        />
      </View>

      <Modal
        visible={showConfigurator}
        animationType="slide"
        onRequestClose={() => setShowConfigurator(false)}
      >
        <View style={styles.modalContainer}>
          <ChartConfigurator
            columns={data?.columns || []}
            onConfigChange={handleConfigChange}
          />
          <View style={styles.modalButtonContainer}>
            <Button
              title="Done"
              onPress={() => setShowConfigurator(false)}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  configButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tooltip: {
    position: 'absolute',
    bottom: 80,
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
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  modalButtonContainer: {
    marginTop: 16,
  },
});

export default ChartScreen;
