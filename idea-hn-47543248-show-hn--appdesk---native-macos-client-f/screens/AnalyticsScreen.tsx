import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { fetchAnalytics, AnalyticsData } from '../services/analytics';

const AnalyticsScreen = ({ route }: { route: any }) => {
  const { appId } = route.params;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAnalytics(appId);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setError('Failed to load analytics data. Please check your connection and try again.');
        Alert.alert('Error', 'Failed to load analytics data. Showing cached data if available.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [appId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error && analyticsData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>No cached data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Analytics</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={350}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: '#e6e6e6' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: 'transparent' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryLine
            data={analyticsData.map(item => ({
              x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: item.sales
            }))}
            style={{
              data: { stroke: '#007AFF', strokeWidth: 2 },
              parent: { border: '1px solid #ccc' }
            }}
          />
        </VictoryChart>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Downloads Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={350}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: '#e6e6e6' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: 'transparent' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryLine
            data={analyticsData.map(item => ({
              x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: item.downloads
            }))}
            style={{
              data: { stroke: '#34C759', strokeWidth: 2 },
              parent: { border: '1px solid #ccc' }
            }}
          />
        </VictoryChart>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ratings Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={350}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: '#e6e6e6' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#756f6a' },
              grid: { stroke: 'transparent' },
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryLine
            data={analyticsData.map(item => ({
              x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: item.rating
            }))}
            style={{
              data: { stroke: '#FF9500', strokeWidth: 2 },
              parent: { border: '1px solid #ccc' }
            }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
});

export default AnalyticsScreen;
