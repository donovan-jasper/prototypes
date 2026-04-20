import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '@/store';
import { generateAnalyticsReport } from '@/lib/export/share';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const { id } = useLocalSearchParams();
  const { sensors, subscriptionStatus } = useStore();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensor = sensors.find(s => s.id === id);

  useEffect(() => {
    if (sensor && subscriptionStatus === 'premium') {
      generateReport();
    }
  }, [sensor, subscriptionStatus]);

  const generateReport = async () => {
    if (!sensor) return;

    setIsLoading(true);
    setError(null);

    try {
      const reportData = await generateAnalyticsReport(sensor.id);
      setReport(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (subscriptionStatus !== 'premium') {
      Alert.alert(
        'Premium Feature',
        'Analytics reports require a premium subscription. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => useStore.getState().upgradeToPremium() }
        ]
      );
      return;
    }

    generateReport();
  };

  if (!sensor) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sensor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{sensor.name} Analytics</Text>
        <Text style={styles.subtitle}>Type: {sensor.type}</Text>
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateReport}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate New Report</Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {report ? (
        <View style={styles.reportContainer}>
          <Text style={styles.reportTitle}>Generated: {new Date(report.generatedAt).toLocaleString()}</Text>

          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: ['8 AM', '12 PM', '4 PM', '8 PM'],
                datasets: [
                  {
                    data: [22.5, 23.1, 22.8, 23.4],
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="°C"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
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

          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Key Insights</Text>

            {report.insights.map((insight: any, index: number) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={styles.confidenceContainer}>
                    <Ionicons name="stats-chart" size={16} color="#666" />
                    <Text style={styles.confidenceText}>{(insight.confidence * 100).toFixed(0)}%</Text>
                  </View>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="analytics" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {subscriptionStatus === 'premium'
              ? 'No report generated yet. Tap "Generate New Report" to analyze your sensor data.'
              : 'Premium feature. Upgrade to access analytics reports.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#8641f4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  reportContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  insightsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AnalyticsScreen;
