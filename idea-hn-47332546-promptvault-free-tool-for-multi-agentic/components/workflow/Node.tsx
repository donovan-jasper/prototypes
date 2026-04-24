import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NodeProps {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  selected: boolean;
  onDragEnd: (id: string, x: number, y: number) => void;
  onPress: () => void;
  onOutputPress: (id: string) => void;
  onInputPress: (id: string) => void;
  outputType?: 'text' | 'image' | 'audio' | 'number';
  inputType?: 'text' | 'image' | 'audio' | 'number';
}

const NODE_ICONS = {
  trigger: 'lightning-bolt',
  ai: 'brain',
  action: 'cog',
};

const NODE_COLORS = {
  trigger: '#4caf50',
  ai: '#2196f3',
  action: '#ff9800',
};

const TYPE_COLORS = {
  text: '#4caf50',
  image: '#ff9800',
  audio: '#2196f3',
  number: '#9c27b0',
};

export default function Node({
  id,
  type,
  label,
  x,
  y,
  selected,
  onDragEnd,
  onPress,
  onOutputPress,
  onInputPress,
  outputType,
  inputType,
}: NodeProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const savedX = useSharedValue(x);
  const savedY = useSharedValue(y);

  React.useEffect(() => {
    translateX.value = withSpring(x);
    translateY.value = withSpring(y);
    savedX.value = x;
    savedY.value = y;
  }, [x, y]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      onDragEnd(id, translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity
          style={[
            styles.node,
            { borderColor: NODE_COLORS[type] },
            selected && styles.selectedNode,
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={NODE_ICONS[type] as any}
              size={20}
              color={NODE_COLORS[type]}
            />
            <Text style={styles.label}>{label}</Text>
          </View>

          <TouchableOpacity
            style={[styles.port, styles.inputPort]}
            onPress={() => onInputPress(id)}
          >
            <View style={[
              styles.portDot,
              { backgroundColor: inputType ? TYPE_COLORS[inputType] : '#6200ee' }
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.port, styles.outputPort]}
            onPress={() => onOutputPress(id)}
          >
            <View style={[
              styles.portDot,
              { backgroundColor: outputType ? TYPE_COLORS[outputType] : '#6200ee' }
            ]} />
          </TouchableOpacity>
        </TouchableOpacity>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  node: {
    width: 150,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedNode: {
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  port: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPort: {
    top: '50%',
    left: -10,
    marginTop: -10,
  },
  outputPort: {
    top: '50%',
    right: -10,
    marginTop: -10,
  },
  portDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
