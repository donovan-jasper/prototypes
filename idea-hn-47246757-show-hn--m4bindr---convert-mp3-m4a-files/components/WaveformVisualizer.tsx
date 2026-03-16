import React from 'react';
import { View, StyleSheet } from 'react-native';

interface WaveformVisualizerProps {
  audioUri: string;
  chapters?: any[];
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioUri, chapters }) => {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
});

export default WaveformVisualizer;
