import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

const TransferProgress = ({ progress, isSending }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSending ? 'Sending File' : 'Receiving File'}
      </Text>
      <ProgressBar
        progress={progress / 100}
        style={styles.progressBar}
        color={Colors.light.tint}
      />
      <Text style={styles.percentage}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.light.text,
  },
});

export default TransferProgress;
