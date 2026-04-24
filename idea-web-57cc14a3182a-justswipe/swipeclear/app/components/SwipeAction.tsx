import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SwipeAction = ({ children, item, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [actionText, setActionText] = React.useState('');
  const [actionColor, setActionColor] = React.useState('#333');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const { dx, dy } = gestureState;

      // Determine which direction has the most movement
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > absDy) {
        // Horizontal swipe
        pan.setValue({ x: dx, y: 0 });
        if (dx > 0) {
          setActionText('Archive');
          setActionColor('#4CAF50');
        } else {
          setActionText('Mute');
          setActionColor('#FF9800');
        }
      } else {
        // Vertical swipe
        pan.setValue({ x: 0, y: dy });
        if (dy > 0) {
          setActionText('Delete');
          setActionColor('#F44336');
        } else {
          setActionText('Pin');
          setActionColor('#2196F3');
        }
      }

      // Calculate opacity based on swipe distance
      const opacityValue = 1 - Math.min(Math.max(Math.abs(dx) / 100, Math.abs(dy) / 100), 0.5);
      opacity.setValue(opacityValue);
    },
    onPanResponderRelease: (e, gestureState) => {
      const { dx, dy } = gestureState;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 100 || absDy > 100) {
        // Trigger action based on direction
        if (absDx > absDy) {
          if (dx > 0) {
            onSwipeRight(item);
          } else {
            onSwipeLeft(item);
          }
        } else {
          if (dy > 0) {
            onSwipeDown(item);
          } else {
            onSwipeUp(item);
          }
        }

        // Animate back to original position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();

        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
      } else {
        // Reset position if swipe wasn't far enough
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();

        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
      }

      setActionText('');
    },
  });

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.actionIndicator,
          {
            opacity: actionText ? 1 : 0,
            backgroundColor: actionColor,
          },
        ]}
      >
        <Text style={styles.actionText}>{actionText}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.swipeable,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  swipeable: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SwipeAction;
