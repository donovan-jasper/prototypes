import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { fetchAnalytics } from '../services/analytics';

const AnalyticsScreen = ({ route, navigation }) => {
  const { appId } = route.params;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await fetchAnalytics(appId);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [appId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics for {appId}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading analytics: {error}</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No analytics data available for this app</Text>
      </View>
    );
  }

  // Prepare data for VictoryChart
  const salesData = analytics.salesData || [];
  const ratingsData = analytics.ratingsData || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.appName}>{analytics.name}</Text>
        <Text style={styles.appId}>{analytics.id}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Average Rating</Text>
          <Text style={styles.metricValue}>{analytics.ratings?.toFixed(1) || 'N/A'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Sales</Text>
          <Text style={styles.metricValue}>{analytics.sales?.toLocaleString() || 'N/A'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Downloads</Text>
          <Text style={styles.metricValue}>{analytics.downloads?.toLocaleString() || 'N/A'}</Text>
        </View>
      </View>

      {salesData.length > 0 && (
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
                grid: { stroke: '#e0e0e0' },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#756f6a' },
                grid: { stroke: '#e0e0e0' },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryLine
              data={salesData}
              x="date"
              y="sales"
              style={{
                data: { stroke: '#007AFF', strokeWidth: 2 },
                parent: { border: '1px solid #ccc' }
              }}
            />
          </VictoryChart>
        </View>
      )}

      {ratingsData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Ratings Over Time</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={200}
            width={350}
            padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: '#756f6a' },
                grid: { stroke: '#e0e0e0' },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#756f6a' },
                grid: { stroke: '#e0e0e0' },
                tickLabels: { fontSize: 10, padding: 5 }
              }}
            />
            <VictoryLine
              data={ratingsData}
              x="date"
              y="rating"
              style={{
                data: { stroke: '#FF9500', strokeWidth: 2 },
                parent: { border: '1px solid #ccc' }
              }}
            />
          </VictoryChart>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  appId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});

export default AnalyticsScreen;
