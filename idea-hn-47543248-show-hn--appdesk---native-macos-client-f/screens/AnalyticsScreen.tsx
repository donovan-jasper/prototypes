import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { fetchAnalytics, AnalyticsData } from '../services/analytics';
import DateTimePicker from '@react-native-community/datetimepicker';

const AnalyticsScreen = ({ route }: { route: any }) => {
  const { appId } = route.params;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [filteredData, setFilteredData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAnalytics(appId);
        setAnalyticsData(data);
        filterDataByDateRange(data, dateRange);
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

  const filterDataByDateRange = (data: AnalyticsData[], range: { start: Date; end: Date }) => {
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= range.start && itemDate <= range.end;
    });
    setFilteredData(filtered);
  };

  const handleDateChange = (type: 'start' | 'end', selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newRange = { ...dateRange, [type]: selectedDate };
      setDateRange(newRange);
      filterDataByDateRange(analyticsData, newRange);
    }
    if (type === 'start') setShowStartPicker(false);
    if (type === 'end') setShowEndPicker(false);
  };

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

      <View style={styles.dateRangeContainer}>
        <View style={styles.datePicker}>
          <Text style={styles.dateLabel}>Start Date:</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateValue}>
              {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={dateRange.start}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('start', date)}
            />
          )}
        </View>

        <View style={styles.datePicker}>
          <Text style={styles.dateLabel}>End Date:</Text>
          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateValue}>
              {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={dateRange.end}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange('end', date)}
            />
          )}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={350}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `Sales: ${datum.y}`}
            />
          }
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
            data={filteredData.map(item => ({
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
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `Downloads: ${datum.y}`}
            />
          }
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
            data={filteredData.map(item => ({
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
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `Rating: ${datum.y.toFixed(1)}`}
            />
          }
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
            data={filteredData.map(item => ({
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

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Reviews Over Time</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={350}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `Reviews: ${datum.y}`}
            />
          }
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
            data={filteredData.map(item => ({
              x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              y: item.reviews
            }))}
            style={{
              data: { stroke: '#5856D6', strokeWidth: 2 },
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
    padding: 16,
    backgroundColor: '#f8f8f8',
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 16,
    color: '#007AFF',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  chartContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});

export default AnalyticsScreen;
