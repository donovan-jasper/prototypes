import React from 'react';
import { Line } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isValid: boolean;
}

const ConnectionLine = ({ from, to, isValid }: ConnectionLineProps) => {
  const theme = useTheme();

  return (
    <Line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={isValid ? theme.colors.primary : theme.colors.error}
      strokeWidth={2}
    />
  );
};

export default ConnectionLine;
