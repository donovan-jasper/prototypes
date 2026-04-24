import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('calibrate.db');

const History = () => {
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM decisions ORDER BY timestamp DESC;',
        [],
        (_, { rows: { _array } }) => setDecisions(_array)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Decision History</Text>
      <FlatList
        data={decisions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.decision}>
            <Text>{item.description}</Text>
            <Text>Actual: {item.actualValue}</Text>
            <Text>Estimated: {item.estimatedValue}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  decision: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
});

export default History;
