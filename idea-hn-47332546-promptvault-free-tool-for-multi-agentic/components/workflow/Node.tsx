import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  onSelect: (nodeId: string) => void;
  onDragEnd: (nodeId: string, x: number, y: number) => void;
  onOutputPress: (nodeId: string) => void;
  onInputPress: (nodeId: string) => void;
  isConnectingFrom: boolean;
}

const Node = ({
  node,
  isSelected,
  onSelect,
  onDragEnd,
  onOutputPress,
  onInputPress,
  isConnectingFrom,
}: NodeProps) => {
  const theme = useTheme();
  const translateX = useSharedValue(node.x);
  const translateY = useSharedValue(node.y);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX + node.x;
      translateY.value = e.translationY + node.y;
    })
    .onEnd(() => {
      isDragging.value = false;
      onDragEnd(node.id, translateX.value, translateY.value);
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

  const getIconName = () => {
    switch (node.type) {
      case 'trigger':
        return 'lightning-bolt';
      case 'ai':
        return 'robot';
      case 'action':
        return 'cog';
      default:
        return 'help-circle';
    }
  };

  const getPortColor = (type: 'input' | 'output') => {
    if (type === 'output' && isConnectingFrom) {
      return theme.colors.primary;
    }
    return theme.colors.onSurfaceVariant;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.nodeContainer, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onSelect(node.id)}
          style={[
            styles.node,
            {
              backgroundColor: getNodeColor(),
              borderColor: isSelected ? theme.colors.primary : 'transparent',
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getIconName()}
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {node.label}
            </Text>
          </View>

          <View style={styles.portsContainer}>
            {node.inputType && (
              <TouchableOpacity
                style={styles.port}
                onPress={() => onInputPress(node.id)}
              >
                <View style={[
                  styles.portCircle,
                  { backgroundColor: getPortColor('input') }
                ]} />
                <Text style={[
                  styles.portLabel,
                  { color: theme.colors.onSurfaceVariant }
                ]}>
                  {node.inputType}
                </Text>
              </TouchableOpacity>
            )}

            {node.outputType && (
              <TouchableOpacity
                style={styles.port}
                onPress={() => onOutputPress(node.id)}
              >
                <Text style={[
                  styles.portLabel,
                  { color: theme.colors.onSurfaceVariant }
                ]}>
                  {node.outputType}
                </Text>
                <View style={[
                  styles.portCircle,
                  { backgroundColor: getPortColor('output') }
                ]} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

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
    padding: 12,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  portLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
});

export default Node;
