import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Line, Circle } from 'react-native-svg';
import Node from './Node';
import { useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useWorkflowStore } from '../../store/workflowStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NodeData {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  config?: Record<string, any>;
  outputType?: 'text' | 'image' | 'audio' | 'number';
  inputType?: 'text' | 'image' | 'audio' | 'number';
}

interface Connection {
  from: string;
  to: string;
}

interface CanvasProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
}

export default function Canvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeSelect,
}: CanvasProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectionValidation, setConnectionValidation] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const { moveNode, addConnection } = useWorkflowStore();

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

  const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    moveNode(nodeId, x, y);
  }, [moveNode]);

  const handleOutputPress = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
    setConnectionValidation(null);
  }, []);

  const handleInputPress = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const fromNode = nodes.find(n => n.id === connectingFrom);
      const toNode = nodes.find(n => n.id === nodeId);

      if (fromNode && toNode) {
        if (fromNode.outputType === toNode.inputType) {
          addConnection(connectingFrom, nodeId);
          setConnectionValidation({
            valid: true,
            message: 'Connection created successfully'
          });
          Toast.show({
            type: 'success',
            text1: 'Connection Created',
            text2: 'Nodes connected successfully',
            visibilityTime: 2000,
          });
        } else {
          const message = `Cannot connect ${fromNode.outputType} output to ${toNode.inputType} input`;
          setConnectionValidation({
            valid: false,
            message
          });
          Toast.show({
            type: 'error',
            text1: 'Connection Error',
            text2: message,
            visibilityTime: 3000,
          });
        }
      }
    }
    setConnectingFrom(null);
    setTimeout(() => setConnectionValidation(null), 3000);
  }, [connectingFrom, nodes, addConnection]);

  const getNodePosition = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  }, [nodes]);

  const getConnectionPoints = useCallback((fromId: string, toId: string) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);

    if (!fromNode || !toNode) return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

    // Calculate connection points based on actual node positions
    const startX = fromNode.x + 75; // Center of output port
    const startY = fromNode.y + 50; // Bottom of node
    const endX = toNode.x + 75;     // Center of input port
    const endY = toNode.y;          // Top of node

    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    };
  }, [nodes]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg style={StyleSheet.absoluteFill}>
            {connections.map((connection) => {
              const { start, end } = getConnectionPoints(connection.from, connection.to);
              return (
                <Line
                  key={`${connection.from}-${connection.to}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={theme.colors.primary}
                  strokeWidth={2}
                />
              );
            })}
          </Svg>

          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isSelected={node.id === selectedNodeId}
              onSelect={() => onNodeSelect(node.id)}
              onDragEnd={handleNodeDragEnd}
              onOutputPress={handleOutputPress}
              onInputPress={handleInputPress}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      {connectionValidation && (
        <View style={[
          styles.validationMessage,
          connectionValidation.valid ? styles.valid : styles.invalid
        ]}>
          <Text style={styles.validationText}>{connectionValidation.message}</Text>
        </View>
      )}
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  validationMessage: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  valid: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  invalid: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  validationText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
