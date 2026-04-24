import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { fetchAnalytics } from '../services/analytics';

const AnalyticsScreen = ({ route }) => {
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  // Prepare data for VictoryChart
  const salesData = analytics.salesData || [];
  const ratingsData = analytics.ratingsData || [];

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>{analytics.name}</Text>

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

      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Average Rating</Text>
          <Text style={styles.metricValue}>{analytics.ratings?.toFixed(1) || 'N/A'}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Downloads</Text>
          <Text style={styles.metricValue}>{analytics.downloads?.toLocaleString() || 'N/A'}</Text>
        </View>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
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
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
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
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AnalyticsScreen;
