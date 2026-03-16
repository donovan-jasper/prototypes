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
        return 'green';
      case 'warning':
        return 'yellow';
      case 'incompatible':
        return 'red';
      default:
        return 'black';
    }
  };

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%">
        <Line
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          stroke={getColor()}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConnectionLine;
