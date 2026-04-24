import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FocusIndicatorProps {
  isFocusActive: boolean;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({ isFocusActive }) => {
  return (
    <View style={[styles.container, isFocusActive ? styles.active : styles.inactive]}>
      <Text style={styles.text}>
        {isFocusActive ? 'FOCUS MODE ACTIVE' : 'FOCUS MODE INACTIVE'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 20,
    margin: 10,
    alignSelf: 'center',
  },
  active: {
    backgroundColor: '#FF6B6B',
  },
  inactive: {
    backgroundColor: '#E0E0E0',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FocusIndicator;
