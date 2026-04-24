import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import useLogs from '../hooks/useLogs';

const LogStream = () => {
  const [queryParams, setQueryParams] = useState({
    severity: '',
    statusCode: '',
    service: '',
    keyword: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { logs, isLoading, error } = useLogs(queryParams);

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

  const handleFilterChange = (field, value) => {
    setQueryParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setQueryParams({
      severity: '',
      statusCode: '',
      service: '',
      keyword: ''
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      <View style={styles.logContent}>
        <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
          {item.severity}
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
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TextInput
        style={styles.filterInput}
        placeholder="Keyword search"
        value={queryParams.keyword}
        onChangeText={(text) => handleFilterChange('keyword', text)}
      />

      <View style={styles.filterRow}>
        <TextInput
          style={[styles.filterInput, styles.halfWidth]}
          placeholder="Severity (ERROR/WARN/INFO)"
          value={queryParams.severity}
          onChangeText={(text) => handleFilterChange('severity', text.toUpperCase())}
        />
        <TextInput
          style={[styles.filterInput, styles.halfWidth]}
          placeholder="Status code"
          value={queryParams.statusCode}
          onChangeText={(text) => handleFilterChange('statusCode', text)}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.filterInput}
        placeholder="Service name"
        value={queryParams.service}
        onChangeText={(text) => handleFilterChange('service', text)}
      />

      <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
        <Text style={styles.clearButtonText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading logs: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Stream</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && renderFilters()}

      {isLoading && logs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : (
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterToggle: {
    padding: 8,
  },
  filterToggleText: {
    color: '#4285f4',
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  halfWidth: {
    width: '48%',
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 5,
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  list: {
    flex: 1,
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
    alignItems: 'flex-start',
  },
  severity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 60,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusCode: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
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
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4285f4',
    padding: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LogStream;
