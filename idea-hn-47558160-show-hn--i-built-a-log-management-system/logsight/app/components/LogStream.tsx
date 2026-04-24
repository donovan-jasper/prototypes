import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

interface LogItem {
  id: string;
  message: string;
  severity: string;
  timestamp: string;
  statusCode?: number;
  service?: string;
}

interface LogStreamProps {
  logs: LogItem[];
  onLogPress?: (log: LogItem) => void;
}

const LogStream = ({ logs, onLogPress }: LogStreamProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: LogItem }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => onLogPress && onLogPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      <View style={styles.logContent}>
        <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
          {item.severity.toUpperCase()}
        </Text>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{item.message}</Text>
          {item.statusCode && (
            <Text style={styles.statusCode}>HTTP {item.statusCode}</Text>
          )}
          {item.service && (
            <Text style={styles.service}>{item.service}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!logs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No logs match your filters</Text>
        </View>
      }
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  logItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  severity: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 60,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  statusCode: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  service: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: '#999',
    fontSize: 16,
  },
});

export default LogStream;
