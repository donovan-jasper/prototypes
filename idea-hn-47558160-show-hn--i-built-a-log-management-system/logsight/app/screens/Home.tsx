import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import LogStream from '../components/LogStream';
import QueryBar from '../components/QueryBar';
import ReplayView from '../components/ReplayView';

const Home = () => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Mock data with proper steps structure
  useEffect(() => {
    const mockLogs = [
      {
        id: 'log-1',
        message: 'API request failed',
        severity: 'error',
        timestamp: '2023-11-15T10:00:00Z',
        steps: [
          { timestamp: '10:00:01', message: 'Request initiated' },
          { timestamp: '10:00:02', message: 'Processing started' },
          { timestamp: '10:00:05', message: 'Database query failed' },
          { timestamp: '10:00:06', message: 'Error returned to client' },
        ]
      },
      {
        id: 'log-2',
        message: 'User login successful',
        severity: 'info',
        timestamp: '2023-11-15T10:05:00Z',
        steps: [
          { timestamp: '10:05:00', message: 'Login attempt' },
          { timestamp: '10:05:01', message: 'Credentials verified' },
          { timestamp: '10:05:02', message: 'Session created' },
        ]
      },
      {
        id: 'log-3',
        message: 'Payment processed',
        severity: 'success',
        timestamp: '2023-11-15T10:10:00Z',
        steps: [
          { timestamp: '10:10:00', message: 'Payment initiated' },
          { timestamp: '10:10:01', message: 'Validation passed' },
          { timestamp: '10:10:03', message: 'Transaction completed' },
        ]
      },
      {
        id: 'log-4',
        message: 'Cache hit',
        severity: 'info',
        timestamp: '2023-11-15T10:15:00Z',
        steps: [
          { timestamp: '10:15:00', message: 'Cache check initiated' },
          { timestamp: '10:15:01', message: 'Cache key found' },
          { timestamp: '10:15:02', message: 'Data retrieved from cache' },
        ]
      },
      {
        id: 'log-5',
        message: 'Background job started',
        severity: 'info',
        timestamp: '2023-11-15T10:20:00Z',
        steps: [
          { timestamp: '10:20:00', message: 'Job scheduled' },
          { timestamp: '10:20:01', message: 'Worker assigned' },
          { timestamp: '10:20:05', message: 'Job completed' },
        ]
      }
    ];

    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  const handleQuery = (filter) => {
    if (!filter) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter(log => {
      return (
        (filter.severity ? log.severity === filter.severity : true) &&
        (filter.keyword ? log.message.toLowerCase().includes(filter.keyword.toLowerCase()) : true)
      );
    });

    setFilteredLogs(filtered);
  };

  const handleLogPress = (log) => {
    setSelectedLog(log);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>LogSight</Text>
      </View>
      <QueryBar onQuery={handleQuery} />
      <LogStream logs={filteredLogs} onLogPress={handleLogPress} />
      {selectedLog && (
        <View style={styles.replayContainer}>
          <ReplayView log={selectedLog} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  replayContainer: {
    flex: 1,
    marginBottom: 20,
  },
});

export default Home;
