import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConflictAlert = ({ message, severity = 'warning' }) => {
  const getAlertStyle = () => {
    switch (severity) {
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      default:
        return styles.warning;
    }
  };

  return (
    <View style={[styles.container, getAlertStyle()]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
  },
  text: {
    color: 'white',
  },
  error: {
    backgroundColor: '#f44336',
  },
  warning: {
    backgroundColor: '#ff9800',
  },
  info: {
    backgroundColor: '#2196f3',
  },
});

export default ConflictAlert;
