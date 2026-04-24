import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SwipeAction = ({ children, item, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        opacity.setValue(1 - Math.abs(gesture.dx) / width);
      },
      onPanResponderRelease: (e, gesture) => {
        const swipeThreshold = width * 0.2;
        const verticalThreshold = 50;

        if (Math.abs(gesture.dx) > swipeThreshold) {
          if (gesture.dx > 0) {
            onSwipeRight(item);
          } else {
            onSwipeLeft(item);
          }
        } else if (Math.abs(gesture.dy) > verticalThreshold) {
          if (gesture.dy > 0) {
            onSwipeDown(item);
          } else {
            onSwipeUp(item);
          }
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();

        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          opacity: opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default SwipeAction;
