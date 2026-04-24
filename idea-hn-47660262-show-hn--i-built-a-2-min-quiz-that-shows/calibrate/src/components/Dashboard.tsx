import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('calibrate.db');

const Dashboard = () => {
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

  const data = decisions.map((decision, index) => ({
    x: index,
    y: Math.abs(decision.actualValue - decision.estimatedValue),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Dashboard</Text>
      <VictoryChart theme={VictoryTheme.material}>
        <VictoryLine data={data} />
      </VictoryChart>
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
});

export default Dashboard;
