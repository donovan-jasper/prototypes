import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface NodeProps {
  node: {
    id: string;
    type: 'trigger' | 'ai' | 'action';
    label: string;
    x: number;
    y: number;
    outputType?: 'text' | 'image' | 'audio' | 'number';
    inputType?: 'text' | 'image' | 'audio' | 'number';
  };
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onOutputPress: () => void;
  onInputPress: () => void;
  isConnectingFrom: boolean;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 100;

export default function Node({
  node,
  isSelected,
  onSelect,
  onDragEnd,
  onOutputPress,
  onInputPress,
  isConnectingFrom,
}: NodeProps) {
  const theme = useTheme();
  const translateX = useSharedValue(node.x);
  const translateY = useSharedValue(node.y);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = node.x + e.translationX;
      translateY.value = node.y + e.translationY;
    })
    .onEnd((e) => {
      const newX = node.x + e.translationX;
      const newY = node.y + e.translationY;
      onDragEnd(newX, newY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const getNodeColor = () => {
    switch (node.type) {
      case 'trigger':
        return theme.colors.primaryContainer;
      case 'ai':
        return theme.colors.secondaryContainer;
      case 'action':
        return theme.colors.tertiaryContainer;
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger':
        return '⚡';
      case 'ai':
        return '🤖';
      case 'action':
        return '🔄';
      default:
        return '❓';
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.nodeContainer, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSelect}
          style={[
            styles.node,
            {
              backgroundColor: getNodeColor(),
              borderColor: isSelected ? theme.colors.primary : 'transparent',
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
        >
          <View style={styles.nodeHeader}>
            <Text style={[
              styles.nodeIcon,
              { color: theme.colors.onSurface }
            ]}>
              {getNodeIcon()}
            </Text>
            <Text
              style={[
                styles.nodeLabel,
                { color: theme.colors.onSurface }
              ]}
              numberOfLines={1}
            >
              {node.label}
            </Text>
          </View>

          <View style={styles.nodePorts}>
            {node.inputType && (
              <TouchableOpacity
                style={[
                  styles.port,
                  styles.inputPort,
                  isConnectingFrom && styles.disabledPort
                ]}
                onPress={onInputPress}
                disabled={isConnectingFrom}
              >
                <View style={[
                  styles.portIndicator,
                  { backgroundColor: theme.colors.primary }
                ]} />
                <Text style={[
                  styles.portLabel,
                  { color: theme.colors.onSurface }
                ]}>
                  {node.inputType}
                </Text>
              </TouchableOpacity>
            )}

            {node.outputType && (
              <TouchableOpacity
                style={[
                  styles.port,
                  styles.outputPort,
                  isConnectingFrom && styles.activePort
                ]}
                onPress={onOutputPress}
              >
                <View style={[
                  styles.portIndicator,
                  { backgroundColor: theme.colors.primary }
                ]} />
                <Text style={[
                  styles.portLabel,
                  { color: theme.colors.onSurface }
                ]}>
                  {node.outputType}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  },
  node: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeIcon: {
    fontSize: 18,
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  nodePorts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  port: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 4,
  },
  inputPort: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  outputPort: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  activePort: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  disabledPort: {
    opacity: 0.5,
  },
  portIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  portLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
});
