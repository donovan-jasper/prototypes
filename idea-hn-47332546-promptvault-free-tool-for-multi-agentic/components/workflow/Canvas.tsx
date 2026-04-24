import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Line, Circle } from 'react-native-svg';
import Node from './Node';
import { useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

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
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeSelect: (nodeId: string) => void;
  onConnectionCreate: (from: string, to: string) => void;
}

export default function Canvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeMove,
  onNodeSelect,
  onConnectionCreate,
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
    setConnectionValidation(null);
  };

  const handleInputPress = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const fromNode = nodes.find(n => n.id === connectingFrom);
      const toNode = nodes.find(n => n.id === nodeId);

      if (fromNode && toNode) {
        if (fromNode.outputType === toNode.inputType) {
          onConnectionCreate(connectingFrom, nodeId);
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

      setConnectingFrom(null);
      setTimeout(() => setConnectionValidation(null), 3000);
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
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              const isValid = fromNode?.outputType === toNode?.inputType;

              return (
                <Line
                  key={`${conn.from}-${conn.to}-${index}`}
                  x1={fromPos.x + 75}
                  y1={fromPos.y + 50}
                  x2={toPos.x + 75}
                  y2={toPos.y + 50}
                  stroke={isValid ? theme.colors.primary : theme.colors.error}
                  strokeWidth="2"
                  strokeDasharray={isValid ? undefined : '5,5'}
                />
              );
            })}

            {connectingFrom && (
              <Line
                x1={getNodePosition(connectingFrom).x + 75}
                y1={getNodePosition(connectingFrom).y + 50}
                x2={getNodePosition(connectingFrom).x + 75 + 50}
                y2={getNodePosition(connectingFrom).y + 50 + 50}
                stroke={theme.colors.primary}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </Svg>

          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isSelected={node.id === selectedNodeId}
              onSelect={() => onNodeSelect(node.id)}
              onDragEnd={(x, y) => handleNodeDragEnd(node.id, x, y)}
              onOutputPress={() => handleOutputPress(node.id)}
              onInputPress={() => handleInputPress(node.id)}
              isConnectingFrom={connectingFrom === node.id}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      {connectionValidation && (
        <View style={[
          styles.validationFeedback,
          {
            backgroundColor: connectionValidation.valid
              ? theme.colors.primaryContainer
              : theme.colors.errorContainer
          }
        ]}>
          <Text style={[
            styles.validationText,
            {
              color: connectionValidation.valid
                ? theme.colors.onPrimaryContainer
                : theme.colors.onErrorContainer
            }
          ]}>
            {connectionValidation.message}
          </Text>
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
    flex: 1,
    width: SCREEN_WIDTH * 3,
    height: SCREEN_HEIGHT * 3,
    backgroundColor: '#f5f5f5',
  },
  validationFeedback: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
