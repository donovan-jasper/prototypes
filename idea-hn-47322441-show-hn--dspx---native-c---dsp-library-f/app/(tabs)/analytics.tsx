import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Share, Dimensions } from 'react-native';
import { useStore } from '@/store';
import { AnalyticsEngine } from '@/lib/analytics/engine';
import { ReportGenerator } from '@/lib/analytics/reportGenerator';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const AnalyticsReportScreen = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'anomalies' | 'correlations'>('patterns');
  const { sensors, subscriptionStatus } = useStore();
  const navigation = useNavigation();

  useEffect(() => {
    const generateReports = async () => {
      try {
        setLoading(true);
        const analyticsEngine = AnalyticsEngine.getInstance();
        const reportPromises = sensors.map(sensor =>
          analyticsEngine.generateFullReport(sensor.id)
        );
        const generatedReports = await Promise.all(reportPromises);
        setReports(generatedReports);
        if (generatedReports.length > 0) {
          setSelectedSensor(generatedReports[0].sensorId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate reports');
      } finally {
        setLoading(false);
      }
    };

    generateReports();
  }, [sensors]);

  const handleShare = async () => {
    if (!selectedSensor) return;

    try {
      const reportGenerator = new ReportGenerator();
      const csvContent = await reportGenerator.generateReport(selectedSensor, {
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

  const handleUpgrade = () => {
    navigation.navigate('settings');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your sensor data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        {error.includes('premium') && subscriptionStatus === 'free' && (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No analytics data available</Text>
        <Text style={styles.subText}>Connect sensors to see insights</Text>
      </View>
    );
  }

  const currentReport = reports.find(r => r.sensorId === selectedSensor) || reports[0];

  const renderPatternsChart = () => {
    if (!currentReport.dailyPatterns || currentReport.dailyPatterns.length === 0) {
      return <Text style={styles.noDataText}>No daily patterns detected</Text>;
    }

    const labels = currentReport.dailyPatterns.map((p: any) => p.timeOfDay);
    const data = currentReport.dailyPatterns.map((p: any) => p.averageValue);

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
    if (!currentReport.anomalies || currentReport.anomalies.length === 0) {
      return <Text style={styles.noDataText}>No anomalies detected in the last 7 days</Text>;
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Detected Anomalies</Text>
        {currentReport.anomalies.map((anomaly: any, index: number) => (
          <View key={index} style={styles.anomalyItem}>
            <View style={styles.anomalyHeader}>
              <Text style={styles.anomalyTitle}>{anomaly.type}</Text>
              <Text style={styles.anomalyConfidence}>Confidence: {Math.round(anomaly.confidence * 100)}%</Text>
            </View>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
            <Text style={styles.anomalyTime}>{new Date(anomaly.timestamp).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCorrelationsChart = () => {
    if (!currentReport.correlations || currentReport.correlations.length === 0) {
      return <Text style={styles.noDataText}>No significant correlations detected</Text>;
    }

    const correlationData = currentReport.correlations.map((c: any) => ({
      name: c.sensorName,
      value: Math.abs(c.correlationCoefficient),
      color: c.correlationCoefficient > 0 ? '#34C759' : '#FF3B30',
      legendFontColor: '#7F8C8D',
      legendFontSize: 12
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sensor Correlations</Text>
        <PieChart
          data={correlationData}
          width={screenWidth - 32}
          height={220}
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
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <Text style={styles.chartDescription}>
          This chart shows how strongly your sensor correlates with other sensors in your system.
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.sensorSelector}>
        <Text style={styles.sectionTitle}>Select Sensor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sensors.map(sensor => (
            <TouchableOpacity
              key={sensor.id}
              style={[
                styles.sensorButton,
                selectedSensor === sensor.id && styles.selectedSensorButton
              ]}
              onPress={() => setSelectedSensor(sensor.id)}
            >
              <Text style={[
                styles.sensorButtonText,
                selectedSensor === sensor.id && styles.selectedSensorButtonText
              ]}>
                {sensor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'patterns' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('patterns')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'patterns' && styles.selectedTabButtonText
          ]}>Patterns</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'anomalies' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('anomalies')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'anomalies' && styles.selectedTabButtonText
          ]}>Anomalies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'correlations' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('correlations')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'correlations' && styles.selectedTabButtonText
          ]}>Correlations</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'patterns' && renderPatternsChart()}
      {selectedTab === 'anomalies' && renderAnomaliesList()}
      {selectedTab === 'correlations' && renderCorrelationsChart()}

      {subscriptionStatus === 'free' && (
        <View style={styles.premiumNotice}>
          <Text style={styles.premiumText}>Upgrade to Premium for advanced analytics features</Text>
          <TouchableOpacity style={styles.premiumButton} onPress={handleUpgrade}>
            <Text style={styles.premiumButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  shareButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6D6D72',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6D6D72',
    textAlign: 'center',
  },
  upgradeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sensorSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sensorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedSensorButton: {
    backgroundColor: '#007AFF',
  },
  sensorButtonText: {
    color: '#1C1C1E',
    fontSize: 14,
  },
  selectedSensorButtonText: {
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTabButton: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#6D6D72',
  },
  selectedTabButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  chartDescription: {
    fontSize: 14,
    color: '#6D6D72',
    marginTop: 8,
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  anomalyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  anomalyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  anomalyConfidence: {
    fontSize: 14,
    color: '#6D6D72',
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  anomalyTime: {
    fontSize: 12,
    color: '#6D6D72',
  },
  noDataText: {
    fontSize: 16,
    color: '#6D6D72',
    textAlign: 'center',
    padding: 20,
  },
  premiumNotice: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AnalyticsReportScreen;
