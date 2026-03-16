import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ConsoleOutput = ({ output }) => {
  return (
    <ScrollView style={styles.container}>
      {output.map((line, index) => (
        <Text key={index} style={styles.line}>{line}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  line: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default ConsoleOutput;
