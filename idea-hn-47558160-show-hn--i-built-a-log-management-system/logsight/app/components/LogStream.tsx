import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import useLogs from '../hooks/useLogs';

const LogStream = () => {
  const { logs, fetchLogs, isLoading } = useLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'ERROR':
        return '#ff4444';
      case 'WARN':
        return '#ffbb33';
      case 'INFO':
        return '#4285f4';
      default:
        return '#666666';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      <View style={styles.logContent}>
        <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
          {item.severity}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
    </View>
  );

  if (isLoading && logs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredLogs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No logs available</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  logItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 60,
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LogStream;
