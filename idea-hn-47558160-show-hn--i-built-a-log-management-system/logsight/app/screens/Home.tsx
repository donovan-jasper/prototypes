import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LogStream from '../components/LogStream';
import QueryBar from '../components/QueryBar';
import ReplayView from '../components/ReplayView';

const Home = () => {
  const [selectedLog, setSelectedLog] = useState(null);

  const handleQuery = (filter) => {
    // Logic to filter logs based on the query
  };

  const handleLogPress = (log) => {
    setSelectedLog(log);
  };

  return (
    <View style={styles.container}>
      <QueryBar onQuery={handleQuery} />
      <LogStream onLogPress={handleLogPress} />
      {selectedLog && <ReplayView log={selectedLog} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Home;
