import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

const TransferProgress = ({ progress, state }) => {
  const getStatusText = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Transferring...';
      case 'completed':
        return 'Transfer complete!';
      case 'failed':
        return 'Transfer failed';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'connecting':
        return Colors.light.warning;
      case 'connected':
        return Colors.light.primary;
      case 'completed':
        return Colors.light.success;
      case 'failed':
        return Colors.light.error;
      default:
        return Colors.light.text;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      <ProgressBar
        progress={progress / 100}
        color={getStatusColor()}
        style={styles.progressBar}
      />
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginVertical: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default TransferProgress;
