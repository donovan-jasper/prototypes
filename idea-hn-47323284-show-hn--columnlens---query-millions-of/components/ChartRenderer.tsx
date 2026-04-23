import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';

interface ChartRendererProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      label?: string;
      color?: string;
    }>;
  };
  type: 'bar' | 'line' | 'pie';
  xAxisLabel?: string;
  yAxisLabel?: string;
  onDataPointClick?: (data: { index: number; value: number; label: string }) => void;
  onTypeChange?: (type: 'bar' | 'line' | 'pie') => void;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  data,
  type = 'bar',
  xAxisLabel = '',
  yAxisLabel = '',
  onDataPointClick,
  onTypeChange
}) => {
  const screenWidth = Dimensions.get('window').width - 32;
  const [selectedType, setSelectedType] = useState(type);

  const handleTypeChange = (newType: 'bar' | 'line' | 'pie') => {
    setSelectedType(newType);
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };

  const chartConfig = {
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
  };

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Prepare data for pie chart
  const pieData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    color: colors[index % colors.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const renderChart = () => {
    switch (selectedType) {
      case 'bar':
        return (
          <BarChart
            data={{
              labels: data.labels,
              datasets: data.datasets.map((dataset, i) => ({
                ...dataset,
                color: (opacity = 1) => colors[i % colors.length],
              })),
            }}
            width={screenWidth}
            height={220}
            yAxisLabel={yAxisLabel}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero={true}
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={false}
            onDataPointClick={({ index, value }) => {
              if (onDataPointClick) {
                onDataPointClick({
                  index,
                  value,
                  label: data.labels[index]
                });
              }
            }}
          />
        );
      case 'line':
        return (
          <LineChart
            data={{
              labels: data.labels,
              datasets: data.datasets.map((dataset, i) => ({
                ...dataset,
                color: (opacity = 1) => colors[i % colors.length],
              })),
            }}
            width={screenWidth}
            height={220}
            yAxisLabel={yAxisLabel}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={false}
            onDataPointClick={({ index, value }) => {
              if (onDataPointClick) {
                onDataPointClick({
                  index,
                  value,
                  label: data.labels[index]
                });
              }
            }}
          />
        );
      case 'pie':
        return (
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              absolute
            />
            <View style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelectorContainer}>
        <Text style={styles.typeSelectorLabel}>Chart Type:</Text>
        <Picker
          selectedValue={selectedType}
          style={styles.typeSelector}
          onValueChange={(itemValue) => handleTypeChange(itemValue as 'bar' | 'line' | 'pie')}
        >
          <Picker.Item label="Bar" value="bar" />
          <Picker.Item label="Line" value="line" />
          <Picker.Item label="Pie" value="pie" />
        </Picker>
      </View>

      {renderChart()}

      {data.datasets.length > 1 && selectedType !== 'pie' && (
        <View style={styles.legendContainer}>
          {data.datasets.map((dataset, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
              <Text style={styles.legendText}>{dataset.label || `Series ${index + 1}`}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeSelectorLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  typeSelector: {
    flex: 1,
    height: 50,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
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

export default ChartRenderer;
