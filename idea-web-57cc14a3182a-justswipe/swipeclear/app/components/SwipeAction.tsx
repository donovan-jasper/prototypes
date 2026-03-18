import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SwipeAction = ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const getSwipeDirection = (dx, dy) => {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  const getOverlayConfig = (dx, dy) => {
    const direction = getSwipeDirection(dx, dy);
    const distance = Math.abs(direction === 'left' || direction === 'right' ? dx : dy);
    const opacity = Math.min(distance / 50, 1);

    switch (direction) {
      case 'down':
        return { color: '#ff4444', icon: 'trash-outline', opacity };
      case 'left':
        return { color: '#4285f4', icon: 'archive-outline', opacity };
      case 'right':
        return { color: '#9e9e9e', icon: 'volume-mute-outline', opacity };
      case 'up':
        return { color: '#ffc107', icon: 'pin-outline', opacity };
      default:
        return { color: 'transparent', icon: null, opacity: 0 };
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const { dx, dy } = gestureState;
        pan.setValue({ x: dx, y: dy });
        
        const config = getOverlayConfig(dx, dy);
        overlayOpacity.setValue(config.opacity);
      },
      onPanResponderRelease: (e, gestureState) => {
        const { dx, dy } = gestureState;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 50) {
            onSwipeRight();
          } else if (dx < -50) {
            onSwipeLeft();
          }
        } else {
          if (dy > 50) {
            onSwipeDown();
          } else if (dy < -50) {
            onSwipeUp();
          }
        }
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  const overlayConfig = pan.x._value !== 0 || pan.y._value !== 0
    ? getOverlayConfig(pan.x._value, pan.y._value)
    : { color: 'transparent', icon: null, opacity: 0 };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: overlayConfig.color,
            opacity: overlayOpacity,
          },
        ]}
      >
        {overlayConfig.icon && (
          <Ionicons name={overlayConfig.icon} size={48} color="white" />
        )}
      </Animated.View>
      <Animated.View
        style={[pan.getLayout(), styles.swipeContainer]}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  swipeContainer: {
    zIndex: 1,
    backgroundColor: 'white',
  },
});

export default SwipeAction;
