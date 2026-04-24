import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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

  // Calculate positions based on component positions
  const fromX = from.position?.x || 0;
  const fromY = from.position?.y || 0;
  const toX = to.position?.x || 0;
  const toY = to.position?.y || 0;

  // Calculate control points for a smooth curve
  const midX = (fromX + toX) / 2;
  const controlY = Math.abs(toY - fromY) / 2;

  // Calculate arrowhead points
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const arrowLength = 15;
  const arrowWidth = 8;

  const arrowX = toX - arrowLength * Math.cos(angle);
  const arrowY = toY - arrowLength * Math.sin(angle);

  const arrowLeftX = arrowX - arrowWidth * Math.sin(angle);
  const arrowLeftY = arrowY + arrowWidth * Math.cos(angle);
  const arrowRightX = arrowX + arrowWidth * Math.sin(angle);
  const arrowRightY = arrowY - arrowWidth * Math.cos(angle);

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%">
        {/* Main connection line */}
        <Path
          d={`M ${fromX} ${fromY} C ${midX} ${fromY + controlY}, ${midX} ${toY - controlY}, ${toX} ${toY}`}
          stroke={getColor()}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Arrowhead */}
        <Path
          d={`M ${arrowLeftX} ${arrowLeftY} L ${toX} ${toY} L ${arrowRightX} ${arrowRightY}`}
          fill={getColor()}
          stroke={getColor()}
          strokeWidth="1"
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
    zIndex: -1,
  },
});

export default ConnectionLine;
