import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLogs } from '../hooks/useLogs';

const LogStream = () => {
  const { logs, fetchLogs } = useLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <Text style={styles.severity}>{item.severity}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <FlatList
      data={filteredLogs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  severity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f00',
  },
  message: {
    fontSize: 14,
  },
});

export default LogStream;
