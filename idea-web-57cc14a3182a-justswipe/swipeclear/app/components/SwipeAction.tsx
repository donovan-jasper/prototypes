import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Text } from 'react-native';

const SwipeAction = ({ children, item, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Show action indicators based on swipe direction
        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);

        if (absX > absY && absX > 50) {
          // Horizontal swipe
          if (gestureState.dx > 0) {
            // Right swipe
            opacity.setValue(1 - (gestureState.dx / 200));
          } else {
            // Left swipe
            opacity.setValue(1 + (gestureState.dx / 200));
          }
        } else if (absY > absX && absY > 50) {
          // Vertical swipe
          if (gestureState.dy > 0) {
            // Down swipe
            scale.setValue(1 - (gestureState.dy / 300));
          } else {
            // Up swipe
            scale.setValue(1 + (gestureState.dy / 300));
          }
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);

        if (absX > absY && absX > 100) {
          // Horizontal swipe
          if (gestureState.dx > 0) {
            // Right swipe
            onSwipeRight(item);
          } else {
            // Left swipe
            onSwipeLeft(item);
          }
        } else if (absY > absX && absY > 100) {
          // Vertical swipe
          if (gestureState.dy > 0) {
            // Down swipe
            onSwipeDown(item);
          } else {
            // Up swipe
            onSwipeUp(item);
          }
        } else {
          // Reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();

          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }).start();

          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getActionIndicator = () => {
    const { dx, dy } = pan.getTranslate();
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX > absY && absX > 50) {
      if (dx > 0) {
        return (
          <View style={[styles.actionIndicator, styles.rightIndicator]}>
            <Text style={styles.actionText}>Mute</Text>
          </View>
        );
      } else {
        return (
          <View style={[styles.actionIndicator, styles.leftIndicator]}>
            <Text style={styles.actionText}>Archive</Text>
          </View>
        );
      }
    } else if (absY > absX && absY > 50) {
      if (dy > 0) {
        return (
          <View style={[styles.actionIndicator, styles.downIndicator]}>
            <Text style={styles.actionText}>Delete</Text>
          </View>
        );
      } else {
        return (
          <View style={[styles.actionIndicator, styles.upIndicator]}>
            <Text style={styles.actionText}>Pin</Text>
          </View>
        );
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.actionContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
            ],
            opacity: opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
      {getActionIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  actionContainer: {
    position: 'relative',
    zIndex: 1,
  },
  actionIndicator: {
    position: 'absolute',
    padding: 8,
    borderRadius: 4,
    zIndex: 0,
  },
  leftIndicator: {
    left: 10,
    top: '50%',
    marginTop: -15,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  rightIndicator: {
    right: 10,
    top: '50%',
    marginTop: -15,
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  upIndicator: {
    top: 10,
    left: '50%',
    marginLeft: -30,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  downIndicator: {
    bottom: 10,
    left: '50%',
    marginLeft: -30,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SwipeAction;
