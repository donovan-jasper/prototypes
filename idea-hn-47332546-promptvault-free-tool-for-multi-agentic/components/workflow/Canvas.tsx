import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import Node from './Node';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NodeData {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  config?: Record<string, any>;
}

interface Connection {
  from: string;
  to: string;
}

interface CanvasProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedNodeId?: string;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeSelect: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
}

export default function Canvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeMove,
  onNodeSelect,
  onConnectionStart,
  onConnectionEnd,
}: CanvasProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleNodeDragEnd = (nodeId: string, x: number, y: number) => {
    onNodeMove(nodeId, x, y);
  };

  const handleOutputPress = (nodeId: string) => {
    setConnectingFrom(nodeId);
    onConnectionStart(nodeId);
  };

  const handleInputPress = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      onConnectionEnd(nodeId);
      setConnectingFrom(null);
    }
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg
            style={StyleSheet.absoluteFill}
            width={SCREEN_WIDTH * 3}
            height={SCREEN_HEIGHT * 3}
          >
            {connections.map((conn, index) => {
              const fromPos = getNodePosition(conn.from);
              const toPos = getNodePosition(conn.to);
              return (
                <Line
                  key={`${conn.from}-${conn.to}-${index}`}
                  x1={fromPos.x + 75}
                  y1={fromPos.y + 50}
                  x2={toPos.x + 75}
                  y2={toPos.y + 50}
                  stroke="#6200ee"
                  strokeWidth="2"
                />
              );
            })}
          </Svg>

          {nodes.map((node) => (
            <Node
              key={node.id}
              id={node.id}
              type={node.type}
              label={node.label}
              x={node.x}
              y={node.y}
              selected={selectedNodeId === node.id}
              onDragEnd={handleNodeDragEnd}
              onPress={() => onNodeSelect(node.id)}
              onOutputPress={handleOutputPress}
              onInputPress={handleInputPress}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  canvas: {
    width: SCREEN_WIDTH * 3,
    height: SCREEN_HEIGHT * 3,
  },
});
