import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const dbService = new DatabaseService();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const data = await dbService.getAnalyticsData();
      setAnalyticsData(data);
      
      // Calculate basic metrics
      const eventTypeCounts = {};
      data.forEach(item => {
        if (eventTypeCounts[item.event_type]) {
          eventTypeCounts[item.event_type]++;
        } else {
          eventTypeCounts[item.event_type] = 1;
        }
      });
      
      setMetrics({
        totalEvents: data.length,
        eventTypeCounts
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics data');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Application Analytics</Text>
      
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Metrics</Text>
        <Text>Total Events: {metrics.totalEvents || 0}</Text>
        {Object.entries(metrics.eventTypeCounts || {}).map(([type, count]) => (
          <Text key={type}>{type}: {count}</Text>
        ))}
      </View>
      
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {analyticsData.length > 0 ? (
          analyticsData.slice(0, 10).map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text>{event.event_type} - {event.timestamp}</Text>
            </View>
          ))
        ) : (
          <Text>No events recorded yet</Text>
        )}
      </View>
      
      <Button title="Refresh Data" onPress={loadAnalyticsData} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsSection: {
    marginBottom: 20,
  },
  eventsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
});

export default Analytics;
