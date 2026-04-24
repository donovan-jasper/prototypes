import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

interface NodeProps {
  node: NodeData;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onOutputPress: () => void;
  onInputPress: () => void;
  isConnectingFrom?: boolean;
}

export default function Node({
  node,
  isSelected,
  onSelect,
  onDragEnd,
  onOutputPress,
  onInputPress,
  isConnectingFrom = false,
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

  const getNodeColor = useCallback(() => {
    switch (node.type) {
      case 'trigger':
        return theme.colors.primary;
      case 'ai':
        return theme.colors.secondary;
      case 'action':
        return theme.colors.tertiary;
      default:
        return theme.colors.surfaceVariant;
    }
  }, [node.type, theme]);

  const getIconName = useCallback(() => {
    switch (node.type) {
      case 'trigger':
        return 'lightning-bolt';
      case 'ai':
        return 'robot';
      case 'action':
        return 'play-circle-outline';
      default:
        return 'help-circle';
    }
  }, [node.type]);

  const getPortColor = useCallback((type: 'input' | 'output') => {
    if (type === 'output') {
      return node.outputType ? getTypeColor(node.outputType) : theme.colors.onSurface;
    } else {
      return node.inputType ? getTypeColor(node.inputType) : theme.colors.onSurface;
    }
  }, [node.outputType, node.inputType, theme]);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'text':
        return '#4CAF50'; // Green
      case 'image':
        return '#2196F3'; // Blue
      case 'audio':
        return '#FF9800'; // Orange
      case 'number':
        return '#9C27B0'; // Purple
      default:
        return theme.colors.onSurface;
    }
  }, [theme]);

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
            }
          ]}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getIconName()}
              size={18}
              color={theme.colors.onPrimary}
            />
            <Text style={[styles.label, { color: theme.colors.onPrimary }]}>
              {node.label}
            </Text>
          </View>

          <View style={styles.portsContainer}>
            {/* Input Port */}
            <TouchableOpacity
              onPress={onInputPress}
              style={[
                styles.port,
                {
                  backgroundColor: getPortColor('input'),
                  borderColor: isConnectingFrom ? theme.colors.error : 'transparent',
                  borderWidth: isConnectingFrom ? 2 : 0,
                }
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-down"
                size={14}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>

            {/* Output Port */}
            <TouchableOpacity
              onPress={onOutputPress}
              style={[
                styles.port,
                {
                  backgroundColor: getPortColor('output'),
                  borderColor: isConnectingFrom ? theme.colors.primary : 'transparent',
                  borderWidth: isConnectingFrom ? 2 : 0,
                }
              ]}
            >
              <MaterialCommunityIcons
                name="arrow-up"
                size={14}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: 150,
    height: 100,
  },
  node: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  portsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  port: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});
