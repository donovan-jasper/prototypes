import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const TaskChain = ({ tasks, chainName }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTasksText}>No tasks in this chain yet.</Text>
      </View>
    );
  }

  const circleRadius = 20;
  const horizontalSpacing = 80; // Space between circle centers
  const startX = 50;
  const startY = 100;
  const svgWidth = startX + (tasks.length - 1) * horizontalSpacing + circleRadius + 20;
  const svgHeight = 200;

  return (
    <View style={styles.container}>
      {chainName && <Text style={styles.chainName}>{chainName}</Text>}
      <Svg height={svgHeight} width={Math.max(300, svgWidth)}>
        {tasks.map((task, index) => {
          const cx = startX + index * horizontalSpacing;
          const cy = startY;

          return (
            <React.Fragment key={index}>
              {/* Circle for the task */}
              <Circle
                cx={cx}
                cy={cy}
                r={circleRadius}
                stroke="#3498db"
                strokeWidth="2"
                fill="#ecf0f1"
              />
              {/* Text for the task name */}
              <SvgText
                x={cx}
                y={cy + 5} // Adjust y to vertically center text
                textAnchor="middle"
                fill="#2c3e50"
                fontSize="12"
                fontWeight="bold"
              >
                {task}
              </SvgText>

              {/* Line connecting to the next task */}
              {index < tasks.length - 1 && (
                <Line
                  x1={cx + circleRadius}
                  y1={cy}
                  x2={cx + horizontalSpacing - circleRadius}
                  y2={cy}
                  stroke="#3498db"
                  strokeWidth="2"
                />
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chainName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  noTasksText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default TaskChain;
