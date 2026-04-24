import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { fetchAnalytics, AnalyticsData } from '../services/analytics';

const AnalyticsScreen = ({ route }: { route: any }) => {
  const { appId } = route.params;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchAnalytics(appId);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
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

  if (analyticsData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Analytics</Text>

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
              y: item.ratings
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
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
});

export default AnalyticsScreen;
