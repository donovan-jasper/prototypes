import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const TaskChain = ({ tasks }) => {
  return (
    <View>
      <Text>Task Chain</Text>
      <Svg height="200" width="300">
        {tasks.map((task, index) => (
          <React.Fragment key={index}>
            <Circle
              cx={50 + index * 50}
              cy="100"
              r="20"
              stroke="black"
              strokeWidth="2"
              fill="white"
            />
            <Text x={50 + index * 50} y="100" textAnchor="middle" fill="black">
              {task}
            </Text>
            {index < tasks.length - 1 && (
              <Line
                x1={70 + index * 50}
                y1="100"
                x2={30 + (index + 1) * 50}
                y2="100"
                stroke="black"
                strokeWidth="2"
              />
            )}
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

export default TaskChain;
