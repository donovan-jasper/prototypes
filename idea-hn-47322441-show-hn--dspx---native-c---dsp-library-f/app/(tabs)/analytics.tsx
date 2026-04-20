import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStore } from '@/store';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const { sensors, generateAnalyticsReport } = useStore();
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]?.id || '');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].id);
    }
  }, [sensors]);

  const generateReport = async () => {
    if (!selectedSensor) return;

    setIsLoading(true);
    setError(null);

    try {
      const reportData = await generateAnalyticsReport(selectedSensor);
      setReport(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDailyPatternsChart = () => {
    if (!report || !report.dailyPatterns || report.dailyPatterns.length === 0) return null;

    const labels = report.dailyPatterns.map((p: any) => p.timeOfDay);
    const data = report.dailyPatterns.map((p: any) => p.averageValue);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Patterns</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data,
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                strokeWidth: 2
              }
            ],
            legend: ['Average Value']
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#ffa726'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    );
  };

  const renderAnomaliesList = () => {
    if (!report || !report.anomalies || report.anomalies.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anomalies Detected</Text>
        {report.anomalies.map((anomaly: any, index: number) => (
          <View key={index} style={styles.anomalyItem}>
            <Text style={styles.anomalyType}>{anomaly.type}</Text>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
            <Text style={styles.anomalyDetails}>
              {new Date(anomaly.timestamp).toLocaleString()} - Value: {anomaly.value}
            </Text>
            <Text style={styles.anomalyConfidence}>Confidence: {(anomaly.confidence * 100).toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCorrelationsList = () => {
    if (!report || !report.correlations || report.correlations.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Correlations with Other Sensors</Text>
        {report.correlations.map((correlation: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.correlationItem}
            onPress={() => navigation.navigate('sensor', { id: correlation.sensorId })}
          >
            <Text style={styles.correlationName}>{correlation.sensorName}</Text>
            <Text style={styles.correlationDetails}>
              Correlation: {correlation.correlationCoefficient} ({correlation.strength})
            </Text>
            <Text style={styles.correlationConfidence}>Confidence: {(correlation.confidence * 100).toFixed(0)}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>

        <View style={styles.sensorSelector}>
          <Text style={styles.label}>Select Sensor:</Text>
          <View style={styles.pickerContainer}>
            {sensors.map((sensor) => (
              <TouchableOpacity
                key={sensor.id}
                style={[
                  styles.pickerItem,
                  selectedSensor === sensor.id && styles.selectedPickerItem
                ]}
                onPress={() => setSelectedSensor(sensor.id)}
              >
                <Text style={[
                  styles.pickerText,
                  selectedSensor === sensor.id && styles.selectedPickerText
                ]}>
                  {sensor.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateReport}
          disabled={isLoading}
        >
          <Text style={styles.generateButtonText}>
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Analyzing data...</Text>
        </View>
      )}

      {report && (
        <View style={styles.reportContainer}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>

          {renderDailyPatternsChart()}
          {renderAnomaliesList()}
          {renderCorrelationsList()}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sensorSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerItem: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  selectedPickerItem: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  pickerText: {
    color: '#333',
  },
  selectedPickerText: {
    color: 'white',
  },
  generateButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  reportContainer: {
    padding: 20,
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  anomalyItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  anomalyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e64a19',
    marginBottom: 5,
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  anomalyDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  anomalyConfidence: {
    fontSize: 12,
    color: '#666',
  },
  correlationItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  correlationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  correlationDetails: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  correlationConfidence: {
    fontSize: 12,
    color: '#666',
  },
});

export default AnalyticsScreen;
