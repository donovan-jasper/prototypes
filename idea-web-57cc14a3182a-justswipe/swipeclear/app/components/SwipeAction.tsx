import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet } from 'react-native';

const SwipeAction = ({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
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
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[pan.getLayout(), styles.swipeContainer]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    flex: 1,
  },
});

export default SwipeAction;
