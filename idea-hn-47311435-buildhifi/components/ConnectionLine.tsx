import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Component } from '@/lib/types';

interface ConnectionLineProps {
  from: Component;
  to: Component;
  status: 'compatible' | 'warning' | 'incompatible';
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to, status }) => {
  const getColor = () => {
    switch (status) {
      case 'compatible':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'incompatible':
        return '#f44336';
      default:
        return '#000000';
    }
  };

  return (
    <View style={styles.container}>
      <Svg height="40" width="100%">
        <Line
          x1="50%"
          y1="0"
          x2="50%"
          y2="40"
          stroke={getColor()}
          strokeWidth="3"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConnectionLine;
