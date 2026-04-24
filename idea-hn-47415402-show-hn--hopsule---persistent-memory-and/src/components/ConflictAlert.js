import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConflictAlert = ({ violations }) => {
  if (!violations || violations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rule Violations Detected</Text>
      {violations.map((violation, index) => (
        <View key={index} style={styles.violationItem}>
          <Text style={[
            styles.violationName,
            violation.severity === 'error' ? styles.errorText : styles.warningText
          ]}>
            {violation.name} ({violation.severity})
          </Text>
          <Text style={styles.violationPattern}>Pattern: {violation.pattern}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  violationItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  violationName: {
    fontWeight: 'bold',
  },
  violationPattern: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
  },
  warningText: {
    color: '#ff9800',
  },
});

export default ConflictAlert;
