import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import Node from './Node';
import { useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useWorkflowStore } from '../../store/workflowStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 20;

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
  const [tempConnection, setTempConnection] = useState<{
    from: string;
    toX: number;
    toY: number;
  } | null>(null);

  const {
    moveNode,
    addConnection,
    validateConnection,
    currentWorkflow,
    checkForCircularReference
  } = useWorkflowStore();

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

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    if (currentWorkflow) {
      const snappedX = snapToGrid(x);
      const snappedY = snapToGrid(y);
      moveNode(nodeId, snappedX, snappedY);
    }
  }, [moveNode, currentWorkflow]);

  const handleOutputPress = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId);
    setConnectionValidation(null);
  }, []);

  const handleInputPress = useCallback((nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId && currentWorkflow) {
      const fromNode = nodes.find(n => n.id === connectingFrom);
      const toNode = nodes.find(n => n.id === nodeId);

      if (fromNode && toNode) {
        const isValidType = validateConnection(fromNode, toNode);
        const isCircular = checkForCircularReference(connectingFrom, nodeId);

        if (isValidType && !isCircular) {
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
          let message = '';
          if (!isValidType) {
            message = `Cannot connect ${fromNode.outputType} output to ${toNode.inputType} input`;
          } else if (isCircular) {
            message = 'Circular reference detected - this connection would create a loop';
          }

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
    setTempConnection(null);
    setTimeout(() => setConnectionValidation(null), 3000);
  }, [connectingFrom, nodes, addConnection, validateConnection, checkForCircularReference, currentWorkflow]);

  const handleCanvasPress = useCallback(() => {
    setConnectingFrom(null);
    setTempConnection(null);
  }, []);

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

  const renderGrid = () => {
    const gridLines = [];
    const gridSize = GRID_SIZE;
    const width = SCREEN_WIDTH * 2;
    const height = SCREEN_HEIGHT * 2;

    for (let x = 0; x <= width; x += gridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={theme.colors.surfaceVariant}
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
      );
    }

    for (let y = 0; y <= height; y += gridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={theme.colors.surfaceVariant}
          strokeWidth={0.5}
          strokeOpacity={0.3}
        />
      );
    }

    return gridLines;
  };

  const renderConnections = () => {
    return connections.map((connection) => {
      const { start, end } = getConnectionPoints(connection.from, connection.to);

      // Create a curved path for the connection
      const controlX = (start.x + end.x) / 2;
      const controlY = start.y + (end.y - start.y) / 2;

      return (
        <Path
          key={`${connection.from}-${connection.to}`}
          d={`M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`}
          stroke={theme.colors.primary}
          strokeWidth={2}
          fill="none"
        />
      );
    });
  };

  const renderTempConnection = () => {
    if (!tempConnection) return null;

    const fromNode = nodes.find(n => n.id === tempConnection.from);
    if (!fromNode) return null;

    const startX = fromNode.x + 75;
    const startY = fromNode.y + 50;

    // Create a curved path for the temporary connection
    const controlX = (startX + tempConnection.toX) / 2;
    const controlY = startY + (tempConnection.toY - startY) / 2;

    return (
      <Path
        d={`M${startX},${startY} Q${controlX},${controlY} ${tempConnection.toX},${tempConnection.toY}`}
        stroke={connectionValidation?.valid ? theme.colors.success : connectionValidation?.valid === false ? theme.colors.error : theme.colors.primary}
        strokeWidth={2}
        strokeDasharray="5,5"
        fill="none"
      />
    );
  };

  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    if (connectingFrom === nodeId) {
      setTempConnection({
        from: nodeId,
        toX: x,
        toY: y
      });
    }
  }, [connectingFrom]);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.canvas} onTouchEnd={handleCanvasPress}>
          <Svg style={StyleSheet.absoluteFill}>
            {renderGrid()}
            {renderConnections()}
            {renderTempConnection()}
          </Svg>

          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={onNodeSelect}
              onDragEnd={handleNodeDragEnd}
              onOutputPress={handleOutputPress}
              onInputPress={handleInputPress}
              onDrag={handleNodeDrag}
            />
          ))}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  canvas: {
    flex: 1,
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: 'transparent',
  },
});
