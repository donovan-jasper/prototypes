import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';

interface ChartConfiguratorProps {
  columns: string[];
  onConfigChange: (config: {
    xAxis: string;
    yAxis: string;
    groupBy?: string;
    chartType: 'bar' | 'line' | 'pie';
  }) => void;
}

const ChartConfigurator: React.FC<ChartConfiguratorProps> = ({ columns, onConfigChange }) => {
  const [xAxis, setXAxis] = useState(columns[0] || '');
  const [yAxis, setYAxis] = useState(columns[1] || '');
  const [groupBy, setGroupBy] = useState<string | undefined>(undefined);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [showGrouping, setShowGrouping] = useState(false);

  useEffect(() => {
    onConfigChange({
      xAxis,
      yAxis,
      groupBy: showGrouping ? groupBy : undefined,
      chartType
    });
  }, [xAxis, yAxis, groupBy, chartType, showGrouping]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Chart Configuration</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Chart Type</Text>
        <Picker
          selectedValue={chartType}
          onValueChange={(itemValue) => setChartType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Bar Chart" value="bar" />
          <Picker.Item label="Line Chart" value="line" />
          <Picker.Item label="Pie Chart" value="pie" />
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>X-Axis (Category)</Text>
        <Picker
          selectedValue={xAxis}
          onValueChange={(itemValue) => setXAxis(itemValue)}
          style={styles.picker}
        >
          {columns.map(col => (
            <Picker.Item key={col} label={col} value={col} />
          ))}
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Y-Axis (Value)</Text>
        <Picker
          selectedValue={yAxis}
          onValueChange={(itemValue) => setYAxis(itemValue)}
          style={styles.picker}
        >
          {columns.map(col => (
            <Picker.Item key={col} label={col} value={col} />
          ))}
        </Picker>
      </View>

      <View style={styles.section}>
        <CheckBox
          title="Group Data"
          checked={showGrouping}
          onPress={() => setShowGrouping(!showGrouping)}
          containerStyle={styles.checkboxContainer}
        />

        {showGrouping && (
          <View style={styles.groupBySection}>
            <Text style={styles.label}>Group By</Text>
            <Picker
              selectedValue={groupBy}
              onValueChange={(itemValue) => setGroupBy(itemValue)}
              style={styles.picker}
            >
              {columns.map(col => (
                <Picker.Item key={col} label={col} value={col} />
              ))}
            </Picker>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
  },
  groupBySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default ChartConfigurator;
