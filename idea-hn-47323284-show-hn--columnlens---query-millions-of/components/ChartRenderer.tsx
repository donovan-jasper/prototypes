import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { generateChartConfig } from '../lib/chart-generator';

interface ChartRendererProps {
  data: {
    columns: string[];
    rows: any[];
  };
  initialType?: 'bar' | 'line' | 'pie';
  onDataPointClick?: (data: { index: number; value: number; label: string }) => void;
  onTypeChange?: (type: 'bar' | 'line' | 'pie') => void;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  data,
  initialType = 'bar',
  onDataPointClick,
  onTypeChange
}) => {
  const screenWidth = Dimensions.get('window').width - 32;
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>(initialType);
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{ index: number; value: number; label: string } | null>(null);

  useEffect(() => {
    if (data && data.rows.length > 0) {
      const config = generateChartConfig(data, chartType);
      setChartConfig(config);
    }
  }, [data, chartType]);

  const handleTypeChange = (newType: 'bar' | 'line' | 'pie') => {
    setChartType(newType);
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  const handleDataPointClick = (dataPoint: { index: number; value: number; label: string }) => {
    setSelectedDataPoint(dataPoint);
    if (onDataPointClick) {
      onDataPointClick(dataPoint);
    }
  };

  const renderChart = () => {
    if (!chartConfig) return null;

    const chartProps = {
      data: chartConfig.data,
      width: screenWidth,
      height: 220,
      yAxisLabel: chartConfig.yAxisLabel,
      chartConfig: {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
      },
      style: styles.chart,
      withHorizontalLabels: true,
      withVerticalLabels: true,
      withInnerLines: false,
      onDataPointClick: handleDataPointClick,
    };

    switch (chartType) {
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'line':
        return <LineChart {...chartProps} bezier />;
      case 'pie':
        const pieData = chartConfig.data.labels.map((label: string, index: number) => ({
          name: label,
          value: chartConfig.data.datasets[0].data[index],
          color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6],
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        }));
        return (
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={220}
              chartConfig={chartProps.chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              absolute
            />
            <ScrollView horizontal style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  if (!chartConfig || data.rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No data available to render chart</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <Text style={styles.label}>Chart Type:</Text>
        <Picker
          selectedValue={chartType}
          style={styles.picker}
          onValueChange={(itemValue) => handleTypeChange(itemValue as 'bar' | 'line' | 'pie')}
        >
          <Picker.Item label="Bar" value="bar" />
          <Picker.Item label="Line" value="line" />
          <Picker.Item label="Pie" value="pie" />
        </Picker>
      </View>

      {renderChart()}

      {selectedDataPoint && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {selectedDataPoint.label}: {selectedDataPoint.value}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default ChartRenderer;
