import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  status: 'compatible' | 'warning' | 'incompatible';
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to, status }) => {
  // Calculate control points for a smooth curve
  const midX = (from.x + to.x) / 2;
  const controlPoint1 = { x: midX, y: from.y };
  const controlPoint2 = { x: midX, y: to.y };

  // Determine line color based on status
  const lineColor = status === 'compatible' ? '#4CAF50' :
                   status === 'warning' ? '#FFC107' :
                   '#FF5252';

  // Calculate arrowhead position and angle
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const arrowSize = 10;
  const arrowX = to.x - arrowSize * Math.cos(angle);
  const arrowY = to.y - arrowSize * Math.sin(angle);

  return (
    <Svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
      {/* Main connection line */}
      <Path
        d={`M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`}
        stroke={lineColor}
        strokeWidth={3}
        fill="none"
      />

      {/* Arrowhead */}
      <Path
        d={`M ${to.x} ${to.y} L ${arrowX + arrowSize * Math.cos(angle - Math.PI/6)} ${arrowY + arrowSize * Math.sin(angle - Math.PI/6)} L ${arrowX + arrowSize * Math.cos(angle + Math.PI/6)} ${arrowY + arrowSize * Math.sin(angle + Math.PI/6)} Z`}
        fill={lineColor}
      />

      {/* Connection dots */}
      <Circle cx={from.x} cy={from.y} r={5} fill={lineColor} />
      <Circle cx={to.x} cy={to.y} r={5} fill={lineColor} />
    </Svg>
  );
};

export default ConnectionLine;
