import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FocusIndicatorProps {
  isFocusActive: boolean;
  isDistractionBlockingActive?: boolean;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({ isFocusActive, isDistractionBlockingActive = false }) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.indicator,
        isFocusActive ? styles.active : styles.inactive
      ]}>
        <Text style={styles.text}>
          {isFocusActive ? 'FOCUS MODE' : 'NOT FOCUSING'}
        </Text>
      </View>
      {isDistractionBlockingActive && (
        <View style={styles.distractionBlocker}>
          <Text style={styles.distractionText}>DISTRACTIONS BLOCKED</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  indicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#F44336',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  distractionBlocker: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#2196F3',
    borderRadius: 15,
  },
  distractionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FocusIndicator;
