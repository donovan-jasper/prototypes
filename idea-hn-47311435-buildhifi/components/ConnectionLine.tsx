import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
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

  // Calculate connection points (bottom center of each component)
  const fromConnectionX = fromX + 75;
  const fromConnectionY = fromY + 200;
  const toConnectionX = toX + 75;
  const toConnectionY = toY;

  // Calculate control points for the curve
  const control1X = fromConnectionX + (toConnectionX - fromConnectionX) * 0.3;
  const control1Y = fromConnectionY;
  const control2X = toConnectionX - (toConnectionX - fromConnectionX) * 0.3;
  const control2Y = toConnectionY;

  // Calculate arrowhead points
  const angle = Math.atan2(toConnectionY - fromConnectionY, toConnectionX - fromConnectionX);
  const arrowLength = 15;
  const arrowWidth = 8;

  const arrowX = toConnectionX - arrowLength * Math.cos(angle);
  const arrowY = toConnectionY - arrowLength * Math.sin(angle);

  const arrowLeftX = arrowX - arrowWidth * Math.sin(angle);
  const arrowLeftY = arrowY + arrowWidth * Math.cos(angle);
  const arrowRightX = arrowX + arrowWidth * Math.sin(angle);
  const arrowRightY = arrowY - arrowWidth * Math.cos(angle);

  // Calculate midpoint for status text
  const midX = (fromConnectionX + toConnectionX) / 2;
  const midY = (fromConnectionY + toConnectionY) / 2 - 20;

  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%">
        {/* Main connection line */}
        <Path
          d={`M ${fromConnectionX} ${fromConnectionY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toConnectionX} ${toConnectionY}`}
          stroke={getColor()}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Arrowhead */}
        <Path
          d={`M ${arrowLeftX} ${arrowLeftY} L ${toConnectionX} ${toConnectionY} L ${arrowRightX} ${arrowRightY}`}
          fill={getColor()}
          stroke={getColor()}
          strokeWidth="1"
        />

        {/* Connection points */}
        <G>
          <Circle
            cx={fromConnectionX}
            cy={fromConnectionY}
            r="5"
            fill={getColor()}
          />
          <Circle
            cx={toConnectionX}
            cy={toConnectionY}
            r="5"
            fill={getColor()}
          />
        </G>

        {/* Status text */}
        {status !== 'compatible' && (
          <SvgText
            x={midX}
            y={midY}
            fill={getColor()}
            fontSize="12"
            textAnchor="middle"
          >
            {status === 'warning' ? '⚠️' : '❌'}
          </SvgText>
        )}
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
