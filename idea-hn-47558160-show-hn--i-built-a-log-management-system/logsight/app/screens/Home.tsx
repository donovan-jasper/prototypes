import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LogStream from '../components/LogStream';
import QueryBar from '../components/QueryBar';
import ReplayView from '../components/ReplayView';

const Home = () => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    const mockLogs = [
      {
        id: 'log-1',
        message: 'API request failed',
        severity: 'error',
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
        steps: [
          { timestamp: '10:10:00', message: 'Payment initiated' },
          { timestamp: '10:10:01', message: 'Validation passed' },
          { timestamp: '10:10:03', message: 'Transaction completed' },
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
    <View style={styles.container}>
      <Text style={styles.header}>LogSight</Text>
      <QueryBar onQuery={handleQuery} />
      <LogStream logs={filteredLogs} onLogPress={handleLogPress} />
      {selectedLog && <ReplayView log={selectedLog} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Home;
