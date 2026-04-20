import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useStore } from '@/store';
import { AnalyticsEngine } from '@/lib/analytics/engine';
import { ReportGenerator } from '@/lib/analytics/reportGenerator';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsReportProps {
  sensorId: string;
}

const screenWidth = Dimensions.get('window').width;

const AnalyticsReport: React.FC<AnalyticsReportProps> = ({ sensorId }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'anomalies' | 'correlations'>('patterns');
  const { subscriptionStatus } = useStore();

  useEffect(() => {
    const generateReport = async () => {
      try {
        setLoading(true);
        const analyticsEngine = AnalyticsEngine.getInstance();
        const fullReport = await analyticsEngine.generateFullReport(sensorId);
        setReport(fullReport);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [sensorId]);

  const handleShare = async () => {
    if (!report) return;

    try {
      const reportGenerator = new ReportGenerator();
      const csvContent = await reportGenerator.generateReport(sensorId, {
        format: 'csv',
        includePatterns: true,
        includeAnomalies: true,
        includeCorrelations: true,
        timeRange: '7d'
      });

      await Share.share({
        message: 'SensorSync Analytics Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        title: 'Share Analytics Report'
      });
    } catch (err) {
      console.error('Error sharing report:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating analytics report...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        {error.includes('premium') && subscriptionStatus === 'free' && (
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  const renderPatternsChart = () => {
    if (!report.dailyPatterns || report.dailyPatterns.length === 0) {
      return <Text style={styles.noDataText}>No daily patterns detected</Text>;
    }

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
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                strokeWidth: 2
              }
            ],
            legend: ['Average Value']
          }}
          width={screenWidth - 32}
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
              stroke: '#007AFF'
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <Text style={styles.chartDescription}>
          Your sensor shows consistent patterns throughout the day. The chart displays the average value at each hour.
        </Text>
      </View>
    );
  };

  const renderAnomaliesList = () => {
    if (!report.anomalies || report.anomalies.length === 0) {
      return <Text style={styles.noDataText}>No anomalies detected in the last 7 days</Text>;
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Detected Anomalies</Text>
        {report.anomalies.map((anomaly: any, index: number) => (
          <View key={index} style={styles.anomalyItem}>
            <View style={styles.anomalyHeader}>
              <Text style={styles.anomalyTimestamp}>
                {new Date(anomaly.timestamp).toLocaleString()}
              </Text>
              <View style={[
                styles.severityIndicator,
                {
                  backgroundColor:
                    anomaly.severity > 0.8 ? '#FF3B30' :
                    anomaly.severity > 0.5 ? '#FF9500' : '#FFCC00'
                }
              ]} />
            </View>
            <Text style={styles.anomalyValue}>Value: {anomaly.value}</Text>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCorrelationsList = () => {
    if (!report.correlations || report.correlations.length === 0) {
      return <Text style={styles.noDataText}>No significant correlations found</Text>;
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Sensor Correlations</Text>
        {report.correlations.map((correlation: any, index: number) => (
          <View key={index} style={styles.correlationItem}>
            <Text style={styles.correlationSensor}>Sensor: {correlation.sensorId}</Text>
            <Text style={styles.correlationCoefficient}>
              Correlation: {correlation.correlationCoefficient > 0 ? '+' : ''}{correlation.correlationCoefficient}
            </Text>
            <Text style={styles.correlationSignificance}>
              Significance: {Math.round(correlation.significance * 100)}%
            </Text>
            <Text style={styles.correlationDescription}>
              {Math.abs(correlation.correlationCoefficient) > 0.8 ? 'Strong' :
               Math.abs(correlation.correlationCoefficient) > 0.5 ? 'Moderate' : 'Weak'} relationship detected.
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Report</Text>
        <Text style={styles.subtitle}>
          Generated: {new Date(report.generatedAt).toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'patterns' && styles.activeTab]}
          onPress={() => setSelectedTab('patterns')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'patterns' && styles.activeTabText
          ]}>Patterns</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'anomalies' && styles.activeTab]}
          onPress={() => setSelectedTab('anomalies')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'anomalies' && styles.activeTabText
          ]}>Anomalies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'correlations' && styles.activeTab]}
          onPress={() => setSelectedTab('correlations')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'correlations' && styles.activeTabText
          ]}>Correlations</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'patterns' && renderPatternsChart()}
      {selectedTab === 'anomalies' && renderAnomaliesList()}
      {selectedTab === 'correlations' && renderCorrelationsList()}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>{report.summary}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e6f2ff',
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  listContainer: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  anomalyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyTimestamp: {
    fontSize: 14,
    color: '#666',
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  anomalyValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#666',
  },
  correlationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  correlationSensor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  correlationCoefficient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  correlationSignificance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  correlationDescription: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  upgradeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalyticsReport;
