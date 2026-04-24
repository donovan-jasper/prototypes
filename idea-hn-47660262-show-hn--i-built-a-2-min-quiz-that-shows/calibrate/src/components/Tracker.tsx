import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('calibrate.db');

const Tracker = () => {
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, actualValue REAL, estimatedValue REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
    });

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

  const addDecision = (description, actualValue, estimatedValue) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO decisions (description, actualValue, estimatedValue) VALUES (?, ?, ?);',
        [description, actualValue, estimatedValue],
        () => fetchDecisions()
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Decision Tracker</Text>
      {decisions.map(decision => (
        <View key={decision.id} style={styles.decision}>
          <Text>{decision.description}</Text>
          <Text>Actual: {decision.actualValue}</Text>
          <Text>Estimated: {decision.estimatedValue}</Text>
        </View>
      ))}
      <Button title="Add Decision" onPress={() => addDecision('New Decision', 100, 90)} />
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

export default Tracker;
